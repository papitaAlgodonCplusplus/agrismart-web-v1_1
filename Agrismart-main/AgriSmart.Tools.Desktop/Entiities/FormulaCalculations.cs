using AgriSmart.Tools.Common;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace AgriSmart.Tools.Entities
{
    public enum BaseElement { N, P, K, Ca, Mg, S, B, Fe, Cu, Zn, Cl, Mn, Mo, Na, C, O, H, Si };

    public static class FormulaCalculations
    {
        public static double getElementMolecularWeight(string element)
        {
            double value = 0;
            Constants.MolecularWeightDic.TryGetValue(element, out value);
            return value;
        }
        public static double getCompoundMolecularWeight(string compound)
        {
            double molecularWeight = 0;

            char[] charArray = compound.ToCharArray();

            char currentChar = char.MinValue;
            char nextChar = char.MinValue;
            bool nextLetter;
            string elementString = "";

            for (int i = 0; i < charArray.Length; i++)
            {
                currentChar = charArray[i];

                if (i < charArray.Length - 1)
                {
                    nextChar = charArray[i + 1];
                    nextLetter = char.IsLetter(nextChar);
                }
                else
                    nextLetter = false;

                if (!nextLetter && i < charArray.Length - 1)
                {
                    if(! char.IsDigit(currentChar))
                        molecularWeight += getElementMolecularWeight(currentChar.ToString()) * Convert.ToInt32(nextChar.ToString());
                }
                else
                {
                    if (char.IsLower(nextChar))
                    {
                        string es = currentChar.ToString() + nextChar.ToString();

                        molecularWeight += getElementMolecularWeight(es);
                    }
                    else
                        molecularWeight += getElementMolecularWeight(currentChar.ToString());
                }

                //molecularWeight += getElementMolecularWeight(elementString);
            }

            return molecularWeight;
        }
        public static double getMolecularWeight(string formula)
        {
            string parsedFormula = parseFormula(formula);

            string formulaToSolve = replaceMolecularWeight(parsedFormula);

            DataTable table = new DataTable();

            var result = table.Compute(formulaToSolve, "");

            return Convert.ToDouble(result);
        }
        private static string parseFormula(string formula)
        {
            double molecularWeight = 0;

            string formulaWithPlus = formula.Replace("+", "").Replace(".", "+").Replace(",", ".");
            string cleanFormula = "";

            char[] charArray = formulaWithPlus.ToCharArray();

            char previousChar = char.MinValue;
            char currentChar = char.MinValue;

            for (int i = 0; i < charArray.Length; i++)
            {
                currentChar = charArray[i];

                if (previousChar != char.MinValue)
                {
                    if (currentChar.ToString() == "(" &&  char.IsDigit(previousChar))
                    {
                        cleanFormula += "*";
                    }

                    if (currentChar.ToString() == "(" && ! char.IsDigit(previousChar))
                    {
                        cleanFormula += "+";
                    }

                    if (previousChar.ToString() == ")" && char.IsDigit(currentChar))
                    {
                        cleanFormula += "*";
                    }

                    if (char.IsDigit(currentChar) && char.IsLetter(previousChar))
                    {
                        cleanFormula += "*";
                    }

                    if (char.IsLetter(previousChar) && char.IsUpper(currentChar))
                    {
                        cleanFormula += "+";
                    }

                    if (char.IsLetter(currentChar) && char.IsDigit(previousChar))
                    {
                        cleanFormula += "+";
                    }
                }

                cleanFormula += currentChar;
                previousChar = currentChar;
            }

            return cleanFormula;
        }
        public static string replaceMolecularWeight(string parsedformula)
        {
            double molecularWeight = 0;

            char[] charArray = parsedformula.ToCharArray();

            char currentChar = char.MinValue;
            char nextChar = char.MinValue;
            bool nextLetter;
            string elementString = "";

            for (int i = 0; i < charArray.Length; i++)
            {
                currentChar = charArray[i];

                if (i < charArray.Length- 1)
                {
                    nextChar = charArray[i + 1];
                    nextLetter = char.IsLetter(nextChar);
                }
                else
                    nextLetter = false;

                if (! nextLetter)
                {
                    elementString = currentChar.ToString();
                }
                else
                {
                    elementString = currentChar.ToString() + nextChar.ToString();
                }

                molecularWeight = getElementMolecularWeight(elementString);


                if (molecularWeight != 0)
                {
                    parsedformula = parsedformula.Replace(elementString, molecularWeight.ToString());
                    elementString = "";
                }
                
                //previousChar = currentChar;
            }

            return parsedformula;
        }
        private static string addPlusp(string formula)
        {
            //5(Ca((NO3)2).2(H2O)).NH4NO3

            string output = "";

            formula = formula.Replace("+","").Replace(".", "+").Replace(",",".");
            char[] charArray = formula.ToCharArray();
            char currentChar = char.MinValue;
            char previousChar = char.MinValue;

            for (int i = 0; i < charArray.Length; i++)
            {
                currentChar = charArray[i];

                if (currentChar.ToString() != ".")
                {
                    if (previousChar != char.MinValue)
                    {
                        if (!char.IsDigit(currentChar))
                        {
                            if (char.IsLetter(previousChar) && currentChar.ToString() == "(")
                                output += "+";

                            if (char.IsDigit(previousChar) && currentChar.ToString() == "(")
                                output += "*";

                            if (char.IsDigit(previousChar) && char.IsLetter(currentChar))
                                output += "+";

                            if ((char.IsUpper(previousChar) && char.IsUpper(currentChar)))
                                output += "+";

                            if ((! char.IsUpper(previousChar) && previousChar.ToString() != "(" && ! char.IsDigit(previousChar) && char.IsUpper(currentChar)))
                                output += "+";

                            if (char.IsDigit(previousChar) && char.IsDigit(currentChar))
                                output += "+";
                        }
                        else
                        {
                            if (previousChar.ToString() != "+" && currentChar.ToString() != "0")
                                output += "*";
                            else
                                output += "+";
                        }
                    }
                }
                else
                {
                    output += "+";
                }


                previousChar = charArray[i];
                output += currentChar.ToString();

            }

            //output = output.Replace("++", "+");
            //output = output.Replace("+)", ")");
            //output = output.Replace("**", "*");

             return output;
        }
        private static string addPlus(string formula)
        {
            //5(Ca((NO3)2).2(H2O)).NH4NO3

            string output = "";

            formula = formula.Replace("+", "").Replace(".", "+").Replace(",", ".");
            char[] charArray = formula.ToCharArray();
            char currentChar = char.MinValue;
            char previousChar = char.MinValue;

            for (int i = 0; i < charArray.Length; i++)
            {
                currentChar = charArray[i];

                if (currentChar.ToString() != ".")
                {
                    if (previousChar != char.MinValue)
                    {
                        if (!char.IsDigit(currentChar))
                        {
                            if (char.IsLetter(previousChar) && currentChar.ToString() == "(")
                                output += "+";

                            if (char.IsDigit(previousChar) && currentChar.ToString() == "(")
                                output += "*";

                            if (char.IsDigit(previousChar) && char.IsLetter(currentChar))
                                output += "+";

                            if ((char.IsUpper(previousChar) && char.IsUpper(currentChar)))
                                output += "+";

                            if ((!char.IsUpper(previousChar) && previousChar.ToString() != "(" && !char.IsDigit(previousChar) && char.IsUpper(currentChar)))
                                output += "+";

                            if (char.IsDigit(previousChar) && char.IsDigit(currentChar))
                                output += "+";
                        }
                        else
                        {
                            if (previousChar.ToString() != "+" && currentChar.ToString() != "0")
                                output += "*";
                            else
                                output += "+";
                        }
                    }
                }
                else
                {
                    output += "+";
                }


                previousChar = charArray[i];
                output += currentChar.ToString();

            }

            //output = output.Replace("++", "+");
            //output = output.Replace("+)", ")");
            //output = output.Replace("**", "*");

            return output;
        }
        private static string getCompleteFormula(string formula)
        {
            string output = "";
            char[] charArray = formula.ToCharArray();
            char currentChar = char.MinValue;
            char previousChar = char.MinValue;
            char nextChar = char.MinValue;

            for (int i = 0; i < charArray.Length; i++)
            {
                currentChar = charArray[i];

                if (previousChar != char.MinValue)
                {
                    if (!char.IsDigit(currentChar))
                    {
                        if(char.IsUpper(previousChar) && char.IsUpper(currentChar))
                        {
                            output += "*1";
                        }

                    }
                }

                previousChar = charArray[i];

                if (char.IsDigit(currentChar))
                    output += "*" + currentChar.ToString();
                else
                {
                    if (currentChar.ToString() == "(")
                        output += "+(";
                    else
                        output += "+" + currentChar.ToString();
                }
            }

            return output;
        }
        private static void addBreak(List<ElementBreakdown> output, string elementString, int n)
        {
            BaseElement baseElement = (BaseElement)Enum.Parse(typeof(BaseElement), elementString);
            ElementBreakdown elementbreak = output.Where(x => x.Element == baseElement).FirstOrDefault();

            if (elementbreak == null)
            {
                output.Add(new ElementBreakdown(baseElement, n));
            }
            else
            {
                elementbreak.N += n;
            }
        }

        //"5Ca((NO3)2.2(H2O)).NH4NO3"; "NO3"
        public static int getNCompound(string formula, string compound)
        {
            string parsedFormula = parseFormula(formula);

            double saltMolecularWeight = getMolecularWeight(parsedFormula);

            string parsedFormulaCompound = parseFormula(compound);

            string cleanFormula = parsedFormula.Replace(parsedFormulaCompound, "0");

            double mw = getMolecularWeight(cleanFormula);

            double cmw = getMolecularWeight(parsedFormulaCompound);

            double dif = saltMolecularWeight - mw;

            return Convert.ToInt32(dif / cmw);
        }
        public static double ConvertToMeqL(double value, string feature)
        {
            double molecularWeight = getCompoundMolecularWeight(feature);
            double valence = Constants.ValenciaDic[feature];

            double equivalentWeight = molecularWeight / valence;
            return value / equivalentWeight;
        }
        public static double GetConvertionFactorFromCompoundToElement(string compoundFormula, string element)
        {
            double CompoundMolecularWieght = getCompoundMolecularWeight(compoundFormula);
            double ElementMolecularWeight = getElementMolecularWeight(element);

            return ElementMolecularWeight / CompoundMolecularWieght; 
        }


    }
}
