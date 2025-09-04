using System.Globalization;

namespace AgriSmart.Tools.Desktop
{
    public static class LanguageManager
    {
        /// <summary>
        /// Stores the culture information for spanish language
        /// </summary>
        private static Culture[] spanishCultures = { new Culture("es-CR", "Español"), new Culture("en-US", "Ingles") };

        /// <summary>
        /// Stores the culture information for english language
        /// </summary>
        private static Culture[] englishCultures = { new Culture("en-US", "English"), new Culture("es-CR", "Spanish") };

        /// <summary>
        /// Gets the default language information
        /// </summary>
        /// <value>The language information array </value>
        public static Culture[] Languages { get; set; } = null;

        /// <summary>
        /// Gets the default index in the languages array
        /// </summary>
        /// <value>Default index in the language array</value>
        public static int DefaultIndex { get; set; }

        #region METHODS
        /// <summary>
        /// Initializes a new instance of the LanguageBE class.
        /// </summary>
        public static void SetLanguages(CultureInfo culture)
        {
            //try to set a culture
            switch (culture.Name)
            {
                //case "en-US": languages = englishCultures; defaultIndex = 0; break;
                case "en-US": Languages = spanishCultures; DefaultIndex = 0; break;
                case "es-CR": Languages = spanishCultures; DefaultIndex = 0; break;
            }

            //try to set an invariant culture
            if (Languages == null)
            {
                switch (culture.Parent.Name)
                {
                    //case "en": languages = englishCultures; defaultIndex = 0; break;
                    case "es": Languages = spanishCultures; DefaultIndex = 0; break;
                    //default: languages = englishCultures; defaultIndex = 0; break;
                    default: Languages = spanishCultures; DefaultIndex = 0; break;
                }
            }
        }


        /// <summary>
        /// Set the CurrentCulture and CurrentUICulture with an specific culture
        /// </summary>
        /// <param name="culture">The culture to be used</param>
        public static void SetCulture(string culture)
        {
            System.Threading.Thread.CurrentThread.CurrentCulture = new CultureInfo(culture);
            System.Threading.Thread.CurrentThread.CurrentUICulture = System.Threading.Thread.CurrentThread.CurrentCulture;
        }

        /// <summary>
        /// Gets the dafult index in the language array associated with a culture
        /// </summary>
        /// <param name="culture">The culture to be used</param>
        /// <returns>The default index</returns>
        public static int IndexOf(string culture)
        {
            int result = -1;
            for (int i = 0; i < Languages.Length; i++)
            {
                if (Languages[i].CultureCode == culture)
                {
                    result = i;
                    break;
                }
            }
            return result;
        }


        #endregion
    }

    public class Culture
    {
        public string CultureCode { get; }
        public string CultureName { get; }

        #region METHODS
        /// <summary>
        /// Initializes a new instance of the Culture class.
        /// </summary>
        /// <param name="cultureCode">The culture code</param>
        /// <param name="cultureName">The culture name</param>
        public Culture(string cultureCode, string cultureName)
        {
            this.CultureCode = cultureCode;
            this.CultureName = cultureName;
        }

        /// <summary>
        /// Converts an object of this class to string
        /// </summary>
        /// <returns>The string representation</returns>
        public override string ToString()
        {
            return CultureName;
        }


        #endregion
    }
}
