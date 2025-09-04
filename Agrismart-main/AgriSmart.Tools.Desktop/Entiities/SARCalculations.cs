using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Tools.Entities
{
    public class SARCalculations
    {
        int ClaseSaliAgua, ClaseSarAgua, RiversideCode;
        string CalificacionSaliAgua;
        string CalificacionSarAgua;
        string TextoNormasUso1;
        string TextoNormasUso2;
        string TextoNormasUso3;
        float ConducAgua, sarAgua; //*5
                                   //Dim i
        string[] EtiquetaSaliAgua = new string[6] { "Baja", "Media", "Alta", "Muy alta", "Excesiva", "Excesiva" };
        string[] EtiquetaSarAgua = new string[4] { "Baja", "Media", "Alta", "Muy alta" };

        private void cal()
        {

            if (sarAgua > -4.19516 * Math.Log(ConducAgua) + 45.837950)
            {
                ClaseSarAgua = 4;
            }
            else if (sarAgua > -3.2272 * Math.Log(ConducAgua) + 33.3457)
            {
                ClaseSarAgua = 3;
            }
            else if (sarAgua > -2.1731 * Math.Log(ConducAgua) + 20.28705)
            {
                ClaseSarAgua = 2;
            }
            else
            {
                ClaseSarAgua = 1;
            }

            CalificacionSarAgua = EtiquetaSarAgua[ClaseSarAgua - 1];

            /*EndSub

            '**************************************************

            Sub GeneraRiversideCode() */

            if (ClaseSaliAgua == 1 && (ClaseSarAgua == 1 || ClaseSarAgua == 2) || (ClaseSaliAgua == 2 && ClaseSarAgua == 1))
            {
                RiversideCode = 1;
            }
            else if (ClaseSaliAgua == 6 && (ClaseSarAgua == 2 || ClaseSarAgua == 3) || (ClaseSarAgua == 4 && (ClaseSaliAgua == 4 || ClaseSaliAgua == 5 || ClaseSaliAgua == 6) && sarAgua < 1.699 * Math.Log(ConducAgua) + 1.9164))
            {
                RiversideCode = 3;
            }
            else
            {
                RiversideCode = 2;
            }

            /*EndSub

            '**************************************************

            Sub CalidadNormasdeUsoTexto()*/

            switch (RiversideCode)
            {
                case 1:
                    TextoNormasUso1 = "Aguas es de buena calidad,aptas para el riego.";
                    break;
                case 2:
                    TextoNormasUso1 = "El agua se puede utilizar para el riego pero con precauciones.";
                    break;
                case 3:
                    TextoNormasUso1 = "El agua NO es apta para el riego.";
                    break;
                default:
                    TextoNormasUso1 = "Error en Codigo Riverside";
                    break;
            }

            switch (ClaseSaliAgua)
            {
                case 1:
                    TextoNormasUso2 = "Agua de baja salinidad, apta para el riego en todos los casos. Pueden existir problemas solamente en suelos de muy baja permeabilidad.";
                    break;
                case 2:
                    TextoNormasUso2 = "Agua de salinidad media, apta para el riego. En ciertos casos puede ser necesario emplear volúmenes de agua en exceso y utilizar cultivos tolerantes a la salinidad. ";
                    break;
                case 3:
                    TextoNormasUso2 = "Agua de salinidad alta que puede utilizarse para el riego en suelos con buen drenaje. empleando volúmenes de agua en exceso para lavar el suelo y utilizando cultivos tolerantes a la salinidad. riego. Sólo debe Usarse en suelos muy permeables y con buen drenaje, empleando volúmenes en exceso para lavar las sales del suelo y utilizando cultivos muy tolerantes a la salinidad.";
                    break;
                case 4:
                    TextoNormasUso2 = "Agua de salinidad muy alta que en muchos casos no es apta para el riego. Sólo debe Usarse en suelos muy permeables y con buen drenaje, empleando volúmenes en exceso para lavar las sales del suelo y utilizando cultivos muy tolerantes a la salinidad.";
                    break;
                case 5:
                    TextoNormasUso2 = "Agua de salinidad excesiva, que sólo debe emplearse en casos muy contados, extremando todas las precauciones apuntadas anteriormente.";
                    break;
                case 6:
                    TextoNormasUso2 = "Agua de salinidad excesiva, no aconsejable para riego.";
                    break;
                default:
                    TextoNormasUso2 = "Error en Codigo Riverside";
                    break;
            }

            switch (ClaseSarAgua)
            {
                case 1:
                    TextoNormasUso3 = "Agua con bajo contenido en sodio, apta para el riego en la mayoría de los casos. Sin embargo, pueden presentarse problemas con cutivos muy sensibles al sodio.";
                    break;
                case 2:
                    TextoNormasUso3 = "Agua con contenido medio de sodio, y por lo tanto, con cierto peligro de acumulación de sodio en el suelo, especialmente en suelos de textura fina (arcillosos y franco-arcillosos) y de baja permeabilidad. Deben vigilarse las condiciones fisicas del suelo y especialmente  el nivel de sodio cambiable del suelo, corrigiendo en caso necesario.";
                    break;
                case 3:
                    TextoNormasUso3 = "Agua con alto contenido de sodio y gran peligro de acumulación del sodio en el suelo. Son aconsejables aportaciones de materia orgánica y el empleo de yeso para corregir el posible exceso de sodio en el suelo. Tambiense requiere un buen drenaje y el emmpleo de volúmenes copiosos de riego.";
                    break;
                case 4:
                    TextoNormasUso3 = "Agua con contenido muy alto de sodio. No es aconsejable para el riego en general, excepto en caso de baja salinidad y tomando todas las precauciones apuntadas.";
                    break;
                default:
                    TextoNormasUso3 = "Error en Codigo Riverside";
                    break;
            }

            /*EndSub

            '**************************************************

            'Main Program*******************

            '*************************************************


            BeginProg
              Call ObtengaConductividadySAR
              Call CalificaSaliAgua
              Call CalificaSarAgua
              Call GeneraRiversideCode
              Call CalidadNormasdeUsoTexto
            EndProg*/

            Console.WriteLine("Peligro de sodio (alcali): " + CalificacionSarAgua);
            Console.WriteLine("Peligro de salinidad: " + CalificacionSaliAgua);
            Console.WriteLine(TextoNormasUso1);
            Console.WriteLine(TextoNormasUso2);
            Console.WriteLine(TextoNormasUso3);
            string x = Console.ReadLine();
        }
        
    }
}

