import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IrrigationDecisionEngineService } from './irrigation-decision-engine.service';
import {
    IrrigationSchedulingService,
    IrrigationMode,
    IrrigationPlan,
    CreateIrrigationPlanEntryCommand,
} from './irrigation-scheduling.service';
import {
    IrrigationPlanEntryHistoryService,
    CreateIrrigationPlanEntryHistoryCommand,
} from './irrigation-plan-entry-history.service';
import { AuthService } from '../../core/auth/auth.service';
import { IrrigationRecommendation } from './models/irrigation-decision.models';

export interface AutoMonitorConfig {
    cropProductionId: number;
    sectorId: number;
    selectedSector: any;
    onDemandMode: IrrigationMode;
    irrigationPlans: IrrigationPlan[];
}

export interface MonitorNotification {
    type: 'success' | 'error';
    message: string;
}

@Injectable({ providedIn: 'root' })
export class IrrigationAutoMonitorService {

    private _autoModeEnabled = new BehaviorSubject<boolean>(false);
    private _autoAcceptEnabled = new BehaviorSubject<boolean>(false);
    private _currentRecommendation = new BehaviorSubject<IrrigationRecommendation | null>(null);
    private _recommendationError = new BehaviorSubject<{ title: string; details: string[] } | null>(null);
    private _isLoadingRecommendation = new BehaviorSubject<boolean>(false);
    private _lastRecommendationTime = new BehaviorSubject<Date | null>(null);
    private _nextCheckCountdown = new BehaviorSubject<number>(0);
    private _isExecuting = new BehaviorSubject<boolean>(false);
    private _notification = new Subject<MonitorNotification>();

    autoModeEnabled$ = this._autoModeEnabled.asObservable();
    autoAcceptEnabled$ = this._autoAcceptEnabled.asObservable();
    currentRecommendation$ = this._currentRecommendation.asObservable();
    recommendationError$ = this._recommendationError.asObservable();
    isLoadingRecommendation$ = this._isLoadingRecommendation.asObservable();
    lastRecommendationTime$ = this._lastRecommendationTime.asObservable();
    nextCheckCountdown$ = this._nextCheckCountdown.asObservable();
    isExecuting$ = this._isExecuting.asObservable();
    notification$ = this._notification.asObservable();

    private config: AutoMonitorConfig | null = null;
    private monitoringInterval: any;
    private countdownInterval: any;
    private cancelRequest$ = new Subject<void>();
    // Prevents re-triggering while a previously auto-accepted irrigation is still running
    private autoAcceptCooldownUntil: Date | null = null;

    constructor(
        private decisionEngine: IrrigationDecisionEngineService,
        private schedulingService: IrrigationSchedulingService,
        private historyService: IrrigationPlanEntryHistoryService,
        private authService: AuthService,
    ) {}

    get isEnabled(): boolean { return this._autoModeEnabled.value; }
    get isAutoAcceptEnabled(): boolean { return this._autoAcceptEnabled.value; }
    get currentConfig(): AutoMonitorConfig | null { return this.config; }

    setAutoAccept(enabled: boolean): void {
        this._autoAcceptEnabled.next(enabled);
        if (!enabled) {
            this.autoAcceptCooldownUntil = null;
        }
    }

    start(config: AutoMonitorConfig): void {
        this.config = config;
        this._autoModeEnabled.next(true);
        this.loadRecommendation();
        this.monitoringInterval = setInterval(() => this.loadRecommendation(), 300000);
        this.startCountdown();
    }

    stop(): void {
        this._autoModeEnabled.next(false);
        this.config = null;
        clearInterval(this.monitoringInterval);
        clearInterval(this.countdownInterval);
        this.monitoringInterval = null;
        this.countdownInterval = null;
        this.cancelRequest$.next();
        this._currentRecommendation.next(null);
        this._recommendationError.next(null);
        this._lastRecommendationTime.next(null);
        this._nextCheckCountdown.next(0);
    }

    updateConfig(partial: Partial<AutoMonitorConfig>): void {
        if (this.config) {
            this.config = { ...this.config, ...partial };
        }
    }

    loadRecommendation(): void {
        if (!this.config) return;
        this.cancelRequest$.next();
        this._isLoadingRecommendation.next(true);
        this._recommendationError.next(null);
        this._lastRecommendationTime.next(new Date());

        this.decisionEngine.getRecommendation(this.config.cropProductionId)
            .pipe(takeUntil(this.cancelRequest$))
            .subscribe({
                next: (recommendation) => {
                    this._currentRecommendation.next(recommendation);
                    this._recommendationError.next(null);
                    this._isLoadingRecommendation.next(false);
                    const inCooldown = this.autoAcceptCooldownUntil !== null && new Date() < this.autoAcceptCooldownUntil;
                    const shouldAutoExec = recommendation.shouldIrrigate && !inCooldown
                        && (this._autoAcceptEnabled.value || recommendation.urgency === 'critical');
                    if (shouldAutoExec) {
                        this.autoExecuteRecommendation(recommendation);
                    }
                },
                error: (error) => {
                    console.error('Error loading recommendation:', error);
                    this._recommendationError.next(this.parseRecommendationError(error));
                    this._currentRecommendation.next(null);
                    this._isLoadingRecommendation.next(false);
                }
            });
    }

    manualExecuteRecommendation(): Observable<void> {
        return new Observable(observer => {
            const recommendation = this._currentRecommendation.value;
            if (!recommendation || !this.config) {
                observer.error(new Error('No recommendation or config available'));
                return;
            }
            if (recommendation.recommendedDuration === null) {
                observer.error(new Error('No se puede ejecutar: faltan datos de configuración para calcular la duración'));
                return;
            }
            const onDemandDefaultPlan = this.config.irrigationPlans.find(p => p.name === 'OnDemandDefault');
            if (!onDemandDefaultPlan) {
                observer.error(new Error('Plan "OnDemandDefault" no encontrado. Cree un plan con ese nombre para continuar.'));
                return;
            }

            const user = this.authService.getCurrentUser();
            const userId: number = user?.id ?? 1;
            const companyId: number = user?.clientId ?? undefined;

            const executionDate = new Date();
            executionDate.setMinutes(executionDate.getMinutes() + 2);

            const command: CreateIrrigationPlanEntryCommand = {
                irrigationPlanId: onDemandDefaultPlan.id,
                irrigationModeId: this.config.onDemandMode.id,
                executionDate: executionDate.toISOString(),
                duration: recommendation.recommendedDuration!,
                sequence: 1,
                active: true,
                createdBy: userId,
                sectorID: this.config.sectorId,
                cropID: this.config.selectedSector?.cropProductionId,
                companyID: companyId
            };

            this._isExecuting.next(true);
            this.schedulingService.createIrrigationPlanEntry(command).subscribe({
                next: () => {
                    this._isExecuting.next(false);
                    observer.next();
                    observer.complete();
                },
                error: (error) => {
                    console.error('Error al crear la entrada del plan de riego:', error);
                    this._isExecuting.next(false);
                    observer.error(error);
                }
            });
        });
    }

    dismissRecommendation(): void {
        this._currentRecommendation.next(null);
    }

    private autoExecuteRecommendation(recommendation: IrrigationRecommendation): void {
        if (!this.config || this._isExecuting.value) return;
        if (recommendation.recommendedDuration === null) {
            this._notification.next({ type: 'error', message: 'No se puede ejecutar automáticamente: faltan datos de configuración para calcular la duración' });
            return;
        }
        const plan = this.config.irrigationPlans[0];
        if (!plan) {
            this._notification.next({ type: 'error', message: 'No irrigation plan available for auto-execution' });
            return;
        }

        const now = new Date();
        const user = this.authService.getCurrentUser();
        const userId: number = user?.id ?? 1;

        const entryCommand: CreateIrrigationPlanEntryCommand = {
            irrigationPlanId: plan.id,
            irrigationModeId: this.config.onDemandMode.id,
            executionDate: now.toISOString(),
            duration: recommendation.recommendedDuration!,
            sequence: 1,
            active: true,
            createdBy: userId
        };

        this._isExecuting.next(true);
        this.schedulingService.createIrrigationPlanEntry(entryCommand).subscribe({
            next: (entryResponse) => {
                const historyCommand: CreateIrrigationPlanEntryHistoryCommand = {
                    irrigationPlanEntryId: entryResponse.id,
                    irrigationPlanId: plan.id,
                    irrigationModeId: this.config!.onDemandMode.id,
                    executionStartTime: now,
                    plannedDuration: recommendation.recommendedDuration!,
                    executionStatus: 'InProgress',
                    isManualExecution: false,
                    notes: `Auto-executed: ${recommendation.reasoning.join('; ')}`,
                    createdBy: userId
                };
                this.historyService.create(historyCommand).subscribe({
                    next: () => {
                        this._isExecuting.next(false);
                        // Set cooldown so we don't re-trigger while this irrigation runs
                        const cooldownMs = recommendation.recommendedDuration! * 60 * 1000;
                        this.autoAcceptCooldownUntil = new Date(now.getTime() + cooldownMs);
                        this._notification.next({ type: 'success', message: `Auto-irrigation started: ${recommendation.recommendedDuration!} min (${recommendation.urgency} urgency)` });
                    },
                    error: (err) => {
                        console.error('Error creating auto-execution history:', err);
                        this._isExecuting.next(false);
                        this._notification.next({ type: 'error', message: 'Failed to create auto-execution history' });
                    }
                });
            },
            error: (error) => {
                console.error('Failed to auto-execute irrigation:', error);
                this._isExecuting.next(false);
                this._notification.next({ type: 'error', message: 'Failed to auto-execute irrigation' });
            }
        });
    }

    private startCountdown(): void {
        this._nextCheckCountdown.next(300);
        this.countdownInterval = setInterval(() => {
            const current = this._nextCheckCountdown.value;
            this._nextCheckCountdown.next(current <= 1 ? 300 : current - 1);
        }, 1000);
    }

    private parseRecommendationError(error: any): { title: string; details: string[] } {
        const message: string = error?.message || String(error) || 'Error desconocido';
        const errorMap: Array<{ match: string; title: string; details: string[] }> = [
            {
                match: 'Sin datos de sensor de humedad de suelo',
                title: 'Sensor de humedad de suelo no disponible',
                details: [
                    'No se encontraron lecturas del sensor water_SOIL en las últimas 24 horas.',
                    'Verifique que el sensor esté conectado y transmitiendo datos al sistema.'
                ]
            },
            {
                match: 'Sin datos de sensor de temperatura',
                title: 'Sensor de temperatura no disponible',
                details: [
                    'No se encontraron lecturas de temperatura en las últimas 24 horas.',
                    'Configure un sensor con tipo "Temperatura del Suelo" en la sección Dispositivos.',
                    'Verifique que el sensor esté activo y conectado.'
                ]
            },
            {
                match: 'Sin historial de eventos de riego',
                title: 'Sin historial de riego detectado',
                details: [
                    'No se detectaron eventos de riego en los últimas 10 días.',
                    'Configure sensores con tipo "Sensor de Flujo de Agua" o "Contador de Pulsos" en la sección Dispositivos.',
                    'Se necesita al menos un evento de flujo reciente para calcular la recomendación.'
                ]
            },
            {
                match: 'No se encontró ningún medio de cultivo activo',
                title: 'Medio de cultivo no configurado',
                details: [
                    'No existe ningún medio de cultivo activo en el sistema.',
                    'Cree y active un medio de cultivo con los campos: Capacidad de Contenedor (%) y Punto de Marchitez Permanente.'
                ]
            },
            {
                match: 'Medio de cultivo sin containerCapacityPercentage',
                title: 'Datos de sustrato incompletos',
                details: [
                    'El medio de cultivo activo no tiene configurado el porcentaje de Capacidad de Contenedor.',
                    'Complete este campo en la configuración del medio de cultivo.'
                ]
            },
            {
                match: 'Medio de cultivo sin permanentWiltingPoint',
                title: 'Datos de sustrato incompletos',
                details: [
                    'El medio de cultivo activo no tiene configurado el Punto de Marchitez Permanente.',
                    'Complete este campo en la configuración del medio de cultivo.'
                ]
            },
            {
                match: 'has no containerId',
                title: 'Producción sin contenedor asignado',
                details: [
                    'Esta producción de cultivo no tiene un contenedor (maceta/bolsa) asignado.',
                    'Asigne un contenedor en la configuración de la producción de cultivo.'
                ]
            }
        ];

        for (const entry of errorMap) {
            if (message.includes(entry.match)) {
                return { title: entry.title, details: entry.details };
            }
        }

        return { title: 'Error al cargar la recomendación de riego', details: [message] };
    }
}
