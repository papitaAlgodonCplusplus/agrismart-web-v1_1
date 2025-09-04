using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Tools.Entities
{
    public static class ObjectExtensions
    {

        public static void CopyPropertiesFrom<T>(this T target, T source)
        {
            if (source == null)
            {
                throw new ArgumentNullException(nameof(source), "Source object cannot be null");
            }

            if (target == null)
            {
                throw new ArgumentNullException(nameof(target), "Target object cannot be null");
            }

            PropertyInfo[] properties = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);

            foreach (var property in properties)
            {
                if (property.CanRead && property.CanWrite)
                {
                    object value = property.GetValue(source);
                    property.SetValue(target, value);
                }
            }
        }

        public static void CopyPropertiesFrom<TSource, TTarget>(this TTarget target, TSource source)
        {
            if (source == null)
            {
                throw new ArgumentNullException(nameof(source), "Source object cannot be null");
            }

            if (target == null)
            {
                throw new ArgumentNullException(nameof(target), "Target object cannot be null");
            }

            // Get the properties of both the source and target types
            PropertyInfo[] sourceProperties = typeof(TSource).GetProperties(BindingFlags.Public | BindingFlags.Instance);
            PropertyInfo[] targetProperties = typeof(TTarget).GetProperties(BindingFlags.Public | BindingFlags.Instance);

            foreach (var sourceProperty in sourceProperties)
            {
                // Find the matching property in the target class (by name and type)
                var targetProperty = Array.Find(targetProperties, prop => prop.Name == sourceProperty.Name && prop.PropertyType == sourceProperty.PropertyType);

                // If the property exists in both the source and target and is readable/writable
                if (targetProperty != null && targetProperty.CanWrite && sourceProperty.CanRead)
                {
                    // Get the value from the source and set it to the target
                    object value = sourceProperty.GetValue(source);
                    targetProperty.SetValue(target, value);
                }
            }
        }
    }
}
