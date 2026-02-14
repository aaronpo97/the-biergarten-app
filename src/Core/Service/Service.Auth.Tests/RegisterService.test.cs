using Domain.Entities;
using Domain.Exceptions;
using FluentAssertions;
using Infrastructure.Email;
using Infrastructure.Email.Templates.Rendering;
using Infrastructure.PasswordHashing;
using Infrastructure.Repository.Auth;
using Moq;

namespace Service.Auth.Tests;

public class RegisterServiceTest
{
   private readonly Mock<IAuthRepository> _authRepoMock;
   private readonly Mock<IPasswordInfrastructure> _passwordInfraMock;
   private readonly Mock<IEmailProvider> _emailProviderMock;
   private readonly Mock<IEmailTemplateProvider> _emailTemplateProviderMock;
   private readonly RegisterService _sut; // System Under Test

   public RegisterServiceTest()
   {
      _authRepoMock = new Mock<IAuthRepository>();
      _passwordInfraMock = new Mock<IPasswordInfrastructure>();
      _emailProviderMock = new Mock<IEmailProvider>();
      _emailTemplateProviderMock = new Mock<IEmailTemplateProvider>();

      _sut = new RegisterService(
          _authRepoMock.Object,
          _passwordInfraMock.Object,
          _emailProviderMock.Object,
          _emailTemplateProviderMock.Object
      );
   }

   [Fact]
   public async Task RegisterAsync_WithValidData_CreatesUserAndSendsEmail()
   {
      // Arrange
      var userAccount = new UserAccount
      {
         Username = "newuser",
         FirstName = "John",
         LastName = "Doe",
         Email = "john.doe@example.com",
         DateOfBirth = new DateTime(1990, 1, 1)
      };
      var password = "SecurePassword123!";
      var hashedPassword = "hashed_password_value";
      var expectedUserId = Guid.NewGuid();
      var expectedEmailHtml = "<html><body>Welcome!</body></html>";

      // Mock: No existing user
      _authRepoMock
          .Setup(x => x.GetUserByUsernameAsync(userAccount.Username))
          .ReturnsAsync((UserAccount?)null);

      _authRepoMock
          .Setup(x => x.GetUserByEmailAsync(userAccount.Email))
          .ReturnsAsync((UserAccount?)null);

      // Mock: Password hashing
      _passwordInfraMock
          .Setup(x => x.Hash(password))
          .Returns(hashedPassword);

      // Mock: User registration
      _authRepoMock
          .Setup(x => x.RegisterUserAsync(
              userAccount.Username,
              userAccount.FirstName,
              userAccount.LastName,
              userAccount.Email,
              userAccount.DateOfBirth,
              hashedPassword))
          .ReturnsAsync(new UserAccount
          {
             UserAccountId = expectedUserId,
             Username = userAccount.Username,
             FirstName = userAccount.FirstName,
             LastName = userAccount.LastName,
             Email = userAccount.Email,
             DateOfBirth = userAccount.DateOfBirth,
             CreatedAt = DateTime.UtcNow
          });

      // Mock: Email template rendering
      _emailTemplateProviderMock
          .Setup(x => x.RenderUserRegisteredEmailAsync(
              userAccount.FirstName,
              It.IsAny<string>()))
          .ReturnsAsync(expectedEmailHtml);

      // Mock: Email sending
      _emailProviderMock
          .Setup(x => x.SendAsync(
              userAccount.Email,
              "Welcome to The Biergarten App!",
              expectedEmailHtml,
              true))
          .Returns(Task.CompletedTask);

      // Act
      var result = await _sut.RegisterAsync(userAccount, password);

      // Assert
      result.Should().NotBeNull();
      result.UserAccountId.Should().Be(expectedUserId);
      result.Username.Should().Be(userAccount.Username);
      result.Email.Should().Be(userAccount.Email);

      // Verify all mocks were called as expected
      _authRepoMock.Verify(x => x.GetUserByUsernameAsync(userAccount.Username), Times.Once);
      _authRepoMock.Verify(x => x.GetUserByEmailAsync(userAccount.Email), Times.Once);
      _passwordInfraMock.Verify(x => x.Hash(password), Times.Once);
      _authRepoMock.Verify(
          x => x.RegisterUserAsync(
              userAccount.Username,
              userAccount.FirstName,
              userAccount.LastName,
              userAccount.Email,
              userAccount.DateOfBirth,
              hashedPassword),
          Times.Once);
      _emailTemplateProviderMock.Verify(
          x => x.RenderUserRegisteredEmailAsync(userAccount.FirstName, It.IsAny<string>()),
          Times.Once);
      _emailProviderMock.Verify(
          x => x.SendAsync(userAccount.Email, "Welcome to The Biergarten App!", expectedEmailHtml, true),
          Times.Once);
   }

   [Fact]
   public async Task RegisterAsync_WithExistingUsername_ThrowsConflictException()
   {
      // Arrange
      var userAccount = new UserAccount
      {
         Username = "existinguser",
         FirstName = "Jane",
         LastName = "Smith",
         Email = "jane.smith@example.com",
         DateOfBirth = new DateTime(1995, 5, 15)
      };
      var password = "Password123!";

      var existingUser = new UserAccount
      {
         UserAccountId = Guid.NewGuid(),
         Username = "existinguser",
         FirstName = "Existing",
         LastName = "User",
         Email = "existing@example.com",
         DateOfBirth = new DateTime(1990, 1, 1)
      };

      _authRepoMock
          .Setup(x => x.GetUserByUsernameAsync(userAccount.Username))
          .ReturnsAsync(existingUser);

      _authRepoMock
          .Setup(x => x.GetUserByEmailAsync(userAccount.Email))
          .ReturnsAsync((UserAccount?)null);

      // Act
      var act = async () => await _sut.RegisterAsync(userAccount, password);

      // Assert
      await act.Should().ThrowAsync<ConflictException>()
          .WithMessage("Username or email already exists");

      // Verify that registration was never called
      _authRepoMock.Verify(
          x => x.RegisterUserAsync(
              It.IsAny<string>(),
              It.IsAny<string>(),
              It.IsAny<string>(),
              It.IsAny<string>(),
              It.IsAny<DateTime>(),
              It.IsAny<string>()),
          Times.Never);

      // Verify email was never sent
      _emailProviderMock.Verify(
          x => x.SendAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>()),
          Times.Never);
   }

   [Fact]
   public async Task RegisterAsync_WithExistingEmail_ThrowsConflictException()
   {
      // Arrange
      var userAccount = new UserAccount
      {
         Username = "newuser",
         FirstName = "Jane",
         LastName = "Smith",
         Email = "existing@example.com",
         DateOfBirth = new DateTime(1995, 5, 15)
      };
      var password = "Password123!";

      var existingUser = new UserAccount
      {
         UserAccountId = Guid.NewGuid(),
         Username = "otheruser",
         FirstName = "Existing",
         LastName = "User",
         Email = "existing@example.com",
         DateOfBirth = new DateTime(1990, 1, 1)
      };

      _authRepoMock
          .Setup(x => x.GetUserByUsernameAsync(userAccount.Username))
          .ReturnsAsync((UserAccount?)null);

      _authRepoMock
          .Setup(x => x.GetUserByEmailAsync(userAccount.Email))
          .ReturnsAsync(existingUser);

      // Act
      var act = async () => await _sut.RegisterAsync(userAccount, password);

      // Assert
      await act.Should().ThrowAsync<ConflictException>()
          .WithMessage("Username or email already exists");

      _authRepoMock.Verify(
          x => x.RegisterUserAsync(
              It.IsAny<string>(),
              It.IsAny<string>(),
              It.IsAny<string>(),
              It.IsAny<string>(),
              It.IsAny<DateTime>(),
              It.IsAny<string>()),
          Times.Never);
   }

   [Fact]
   public async Task RegisterAsync_PasswordIsHashed_BeforeStoringInDatabase()
   {
      // Arrange
      var userAccount = new UserAccount
      {
         Username = "secureuser",
         FirstName = "Secure",
         LastName = "User",
         Email = "secure@example.com",
         DateOfBirth = new DateTime(1990, 1, 1)
      };
      var plainPassword = "PlainPassword123!";
      var hashedPassword = "hashed_secure_password";

      _authRepoMock
          .Setup(x => x.GetUserByUsernameAsync(It.IsAny<string>()))
          .ReturnsAsync((UserAccount?)null);

      _authRepoMock
          .Setup(x => x.GetUserByEmailAsync(It.IsAny<string>()))
          .ReturnsAsync((UserAccount?)null);

      _passwordInfraMock
          .Setup(x => x.Hash(plainPassword))
          .Returns(hashedPassword);

      _authRepoMock
          .Setup(x => x.RegisterUserAsync(
              It.IsAny<string>(),
              It.IsAny<string>(),
              It.IsAny<string>(),
              It.IsAny<string>(),
              It.IsAny<DateTime>(),
              hashedPassword))
          .ReturnsAsync(new UserAccount { UserAccountId = Guid.NewGuid() });

      _emailTemplateProviderMock
          .Setup(x => x.RenderUserRegisteredEmailAsync(It.IsAny<string>(), It.IsAny<string>()))
          .ReturnsAsync("<html></html>");

      // Act
      await _sut.RegisterAsync(userAccount, plainPassword);

      // Assert
      _passwordInfraMock.Verify(x => x.Hash(plainPassword), Times.Once);
      _authRepoMock.Verify(
          x => x.RegisterUserAsync(
              userAccount.Username,
              userAccount.FirstName,
              userAccount.LastName,
              userAccount.Email,
              userAccount.DateOfBirth,
              hashedPassword), // Verify hashed password is used
          Times.Once);
   }

   [Fact]
   public async Task RegisterAsync_EmailConfirmationLink_ContainsUserEmail()
   {
      // Arrange
      var userAccount = new UserAccount
      {
         Username = "testuser",
         FirstName = "Test",
         LastName = "User",
         Email = "test@example.com",
         DateOfBirth = new DateTime(1990, 1, 1)
      };
      var password = "Password123!";
      string? capturedConfirmationLink = null;

      _authRepoMock
          .Setup(x => x.GetUserByUsernameAsync(It.IsAny<string>()))
          .ReturnsAsync((UserAccount?)null);

      _authRepoMock
          .Setup(x => x.GetUserByEmailAsync(It.IsAny<string>()))
          .ReturnsAsync((UserAccount?)null);

      _passwordInfraMock
          .Setup(x => x.Hash(It.IsAny<string>()))
          .Returns("hashed");

      _authRepoMock
          .Setup(x => x.RegisterUserAsync(
              It.IsAny<string>(),
              It.IsAny<string>(),
              It.IsAny<string>(),
              It.IsAny<string>(),
              It.IsAny<DateTime>(),
              It.IsAny<string>()))
          .ReturnsAsync(new UserAccount
          {
             UserAccountId = Guid.NewGuid(),
             Username = userAccount.Username,
             FirstName = userAccount.FirstName,
             LastName = userAccount.LastName,
             Email = userAccount.Email,
             DateOfBirth = userAccount.DateOfBirth
          });

      _emailTemplateProviderMock
          .Setup(x => x.RenderUserRegisteredEmailAsync(
              It.IsAny<string>(),
              It.IsAny<string>()))
          .Callback<string, string>((_, link) => capturedConfirmationLink = link)
          .ReturnsAsync("<html></html>");

      // Act
      await _sut.RegisterAsync(userAccount, password);

      // Assert
      capturedConfirmationLink.Should().NotBeNull();
      capturedConfirmationLink.Should().Contain(Uri.EscapeDataString(userAccount.Email));
   }

   [Fact]
   public async Task RegisterAsync_WhenEmailSendingFails_ExceptionPropagates()
   {
      // Arrange
      var userAccount = new UserAccount
      {
         Username = "testuser",
         FirstName = "Test",
         LastName = "User",
         Email = "test@example.com",
         DateOfBirth = new DateTime(1990, 1, 1)
      };
      var password = "Password123!";

      _authRepoMock
          .Setup(x => x.GetUserByUsernameAsync(It.IsAny<string>()))
          .ReturnsAsync((UserAccount?)null);

      _authRepoMock
          .Setup(x => x.GetUserByEmailAsync(It.IsAny<string>()))
          .ReturnsAsync((UserAccount?)null);

      _passwordInfraMock
          .Setup(x => x.Hash(It.IsAny<string>()))
          .Returns("hashed");

      _authRepoMock
          .Setup(x => x.RegisterUserAsync(
              It.IsAny<string>(),
              It.IsAny<string>(),
              It.IsAny<string>(),
              It.IsAny<string>(),
              It.IsAny<DateTime>(),
              It.IsAny<string>()))
          .ReturnsAsync(new UserAccount { UserAccountId = Guid.NewGuid(), Email = userAccount.Email });

      _emailTemplateProviderMock
          .Setup(x => x.RenderUserRegisteredEmailAsync(It.IsAny<string>(), It.IsAny<string>()))
          .ReturnsAsync("<html></html>");

      _emailProviderMock
          .Setup(x => x.SendAsync(
              It.IsAny<string>(),
              It.IsAny<string>(),
              It.IsAny<string>(),
              It.IsAny<bool>()))
          .ThrowsAsync(new InvalidOperationException("SMTP server unavailable"));

      // Act
      var act = async () => await _sut.RegisterAsync(userAccount, password);

      // Assert
      await act.Should().ThrowAsync<InvalidOperationException>()
          .WithMessage("SMTP server unavailable");
   }
}
