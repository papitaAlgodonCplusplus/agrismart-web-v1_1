using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace AgriSmart.Api.Agronomic
{
    /// <summary>
    /// Serializes DateTime values as UTC ISO-8601 strings (always with 'Z').
    /// EF Core reads SQL Server datetime columns as DateTimeKind.Unspecified;
    /// without this converter System.Text.Json omits the 'Z', causing JavaScript
    /// clients to interpret the value as local time instead of UTC.
    /// </summary>
    public class UtcDateTimeJsonConverter : JsonConverter<DateTime>
    {
        public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
            => DateTime.SpecifyKind(reader.GetDateTime(), DateTimeKind.Utc);

        public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
            => writer.WriteStringValue(DateTime.SpecifyKind(value, DateTimeKind.Utc));
    }

    /// <summary>Nullable variant of <see cref="UtcDateTimeJsonConverter"/>.</summary>
    public class UtcNullableDateTimeJsonConverter : JsonConverter<DateTime?>
    {
        public override DateTime? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.Null) return null;
            return DateTime.SpecifyKind(reader.GetDateTime(), DateTimeKind.Utc);
        }

        public override void Write(Utf8JsonWriter writer, DateTime? value, JsonSerializerOptions options)
        {
            if (value is null) writer.WriteNullValue();
            else writer.WriteStringValue(DateTime.SpecifyKind(value.Value, DateTimeKind.Utc));
        }
    }
}
