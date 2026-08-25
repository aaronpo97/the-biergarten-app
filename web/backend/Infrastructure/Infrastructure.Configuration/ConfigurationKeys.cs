namespace Infrastructure.Configuration;

public static class ConfigurationKeys
{
    public const string AccessTokenSecret = "ACCESS_TOKEN_SECRET";
    public const string RefreshTokenSecret = "REFRESH_TOKEN_SECRET";
    public const string ConfirmationTokenSecret = "CONFIRMATION_TOKEN_SECRET";

    /// <summary>
    ///     Fallback configuration section path for the access-token signing key, checked when
    ///     <see cref="AccessTokenSecret" /> is not set.
    /// </summary>
    public const string JwtSecretKeyFallback = "Jwt:SecretKey";

    public const string WebsiteBaseUrl = "WEBSITE_BASE_URL";

    public const string SmtpHost = "SMTP_HOST";
    public const string SmtpPort = "SMTP_PORT";
    public const string SmtpUsername = "SMTP_USERNAME";
    public const string SmtpPassword = "SMTP_PASSWORD";
    public const string SmtpUseSsl = "SMTP_USE_SSL";
    public const string SmtpFromEmail = "SMTP_FROM_EMAIL";
    public const string SmtpFromName = "SMTP_FROM_NAME";

    public const string DbServer = "DB_SERVER";
    public const string DbUser = "DB_USER";
    public const string DbPassword = "DB_PASSWORD";
    public const string DbName = "DB_NAME";
    public const string DbConnectionString = "DB_CONNECTION_STRING";
    public const string DbTrustServerCertificate = "DB_TRUST_SERVER_CERTIFICATE";

    public const string ClearDatabase = "CLEAR_DATABASE";
}
