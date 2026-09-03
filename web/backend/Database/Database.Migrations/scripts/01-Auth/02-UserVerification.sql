CREATE TABLE Auth.UserVerification -- delete verification data when user account is deleted
(
    UserVerificationID UNIQUEIDENTIFIER
        CONSTRAINT DF_UserVerificationID DEFAULT NEWID(),

    UserAccountID UNIQUEIDENTIFIER NOT NULL,

    VerificationDateTime DATETIME NOT NULL
        CONSTRAINT DF_VerificationDateTime DEFAULT GETDATE(),

    RowVersion ROWVERSION,

    CONSTRAINT PK_UserVerification
        PRIMARY KEY (UserVerificationID),

    CONSTRAINT FK_UserVerification_UserAccount
        FOREIGN KEY (UserAccountID)
            REFERENCES Auth.UserAccount (UserAccountID)
            ON DELETE CASCADE,

    CONSTRAINT AK_UserVerification_UserAccountID
        UNIQUE (UserAccountID)
);

CREATE
NONCLUSTERED INDEX IX_UserVerification_UserAccount
    ON Auth.UserVerification(UserAccountID);
