using DataAccessLayer;
using DataAccessLayer.Entities;
using DataAccessLayer.Repositories;

namespace DALTests
{
    public class UserAccountRepositoryTests
    {
        private readonly IUserAccountRepository _repository = new InMemoryUserAccountRepository();

        [Fact]
        public async Task Add_ShouldInsertUserAccount()
        {
            // Arrange
            var userAccount = new UserAccount
            {
                UserAccountId = Guid.NewGuid(),
                Username = "testuser",
                FirstName = "Test",
                LastName = "User",
                Email = "testuser@example.com",
                CreatedAt = DateTime.UtcNow,
                DateOfBirth = new DateTime(1990, 1, 1),
            };

            // Act
            await _repository.Add(userAccount);
            var retrievedUser = await _repository.GetById(userAccount.UserAccountId);

            // Assert
            Assert.NotNull(retrievedUser);
            Assert.Equal(userAccount.Username, retrievedUser.Username);
        }

        [Fact]
        public async Task GetById_ShouldReturnUserAccount()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var userAccount = new UserAccount
            {
                UserAccountId = userId,
                Username = "existinguser",
                FirstName = "Existing",
                LastName = "User",
                Email = "existinguser@example.com",
                CreatedAt = DateTime.UtcNow,
                DateOfBirth = new DateTime(1985, 5, 15),
            };
            await _repository.Add(userAccount);

            // Act
            var retrievedUser = await _repository.GetById(userId);

            // Assert
            Assert.NotNull(retrievedUser);
            Assert.Equal(userId, retrievedUser.UserAccountId);
        }

        [Fact]
        public async Task Update_ShouldModifyUserAccount()
        {
            // Arrange
            var userAccount = new UserAccount
            {
                UserAccountId = Guid.NewGuid(),
                Username = "updatableuser",
                FirstName = "Updatable",
                LastName = "User",
                Email = "updatableuser@example.com",
                CreatedAt = DateTime.UtcNow,
                DateOfBirth = new DateTime(1992, 3, 10),
            };
            await _repository.Add(userAccount);

            // Act
            userAccount.FirstName = "Updated";
            await _repository.Update(userAccount);
            var updatedUser = await _repository.GetById(userAccount.UserAccountId);

            // Assert
            Assert.NotNull(updatedUser);
            Assert.Equal("Updated", updatedUser.FirstName);
        }

        [Fact]
        public async Task Delete_ShouldRemoveUserAccount()
        {
            // Arrange
            var userAccount = new UserAccount
            {
                UserAccountId = Guid.NewGuid(),
                Username = "deletableuser",
                FirstName = "Deletable",
                LastName = "User",
                Email = "deletableuser@example.com",
                CreatedAt = DateTime.UtcNow,
                DateOfBirth = new DateTime(1995, 7, 20),
            };
            await _repository.Add(userAccount);

            // Act
            await _repository.Delete(userAccount.UserAccountId);
            var deletedUser = await _repository.GetById(userAccount.UserAccountId);

            // Assert
            Assert.Null(deletedUser);
        }

        [Fact]
        public async Task GetAll_ShouldReturnAllUserAccounts()
        {
            // Arrange
            var user1 = new UserAccount
            {
                UserAccountId = Guid.NewGuid(),
                Username = "user1",
                FirstName = "User",
                LastName = "One",
                Email = "user1@example.com",
                CreatedAt = DateTime.UtcNow,
                DateOfBirth = new DateTime(1990, 1, 1),
            };
            var user2 = new UserAccount
            {
                UserAccountId = Guid.NewGuid(),
                Username = "user2",
                FirstName = "User",
                LastName = "Two",
                Email = "user2@example.com",
                CreatedAt = DateTime.UtcNow,
                DateOfBirth = new DateTime(1992, 2, 2),
            };
            await _repository.Add(user1);
            await _repository.Add(user2);

            // Act
            var allUsers = await _repository.GetAll(null, null);

            // Assert
            Assert.NotNull(allUsers);
            Assert.True(allUsers.Count() >= 2);
        }

        [Fact]
        public async Task GetAll_WithPagination_ShouldRespectLimit()
        {
            // Arrange
            var users = new List<UserAccount>
            {
                new UserAccount
                {
                    UserAccountId = Guid.NewGuid(),
                    Username = $"pageuser_{Guid.NewGuid():N}",
                    FirstName = "Page",
                    LastName = "User",
                    Email = $"pageuser_{Guid.NewGuid():N}@example.com",
                    CreatedAt = DateTime.UtcNow,
                    DateOfBirth = new DateTime(1991, 4, 4),
                },
                new UserAccount
                {
                    UserAccountId = Guid.NewGuid(),
                    Username = $"pageuser_{Guid.NewGuid():N}",
                    FirstName = "Page",
                    LastName = "User",
                    Email = $"pageuser_{Guid.NewGuid():N}@example.com",
                    CreatedAt = DateTime.UtcNow,
                    DateOfBirth = new DateTime(1992, 5, 5),
                },
                new UserAccount
                {
                    UserAccountId = Guid.NewGuid(),
                    Username = $"pageuser_{Guid.NewGuid():N}",
                    FirstName = "Page",
                    LastName = "User",
                    Email = $"pageuser_{Guid.NewGuid():N}@example.com",
                    CreatedAt = DateTime.UtcNow,
                    DateOfBirth = new DateTime(1993, 6, 6),
                },
            };

            foreach (var user in users)
            {
                await _repository.Add(user);
            }

            // Act
            var page = (await _repository.GetAll(2, 0)).ToList();

            // Assert
            Assert.Equal(2, page.Count);
        }

        [Fact]
        public async Task GetAll_WithPagination_ShouldValidateArguments()
        {
            await Assert.ThrowsAsync<ArgumentOutOfRangeException>(async () =>
                (await _repository.GetAll(0, 0)).ToList()
            );
            await Assert.ThrowsAsync<ArgumentOutOfRangeException>(async () =>
                (await _repository.GetAll(1, -1)).ToList()
            );
        }
    }

    internal class InMemoryUserAccountRepository : IUserAccountRepository
    {
        private readonly Dictionary<Guid, UserAccount> _store = new();

        public Task Add(UserAccount userAccount)
        {
            if (userAccount.UserAccountId == Guid.Empty)
            {
                userAccount.UserAccountId = Guid.NewGuid();
            }
            _store[userAccount.UserAccountId] = Clone(userAccount);
            return Task.CompletedTask;
        }

        public Task<UserAccount?> GetById(Guid id)
        {
            _store.TryGetValue(id, out var user);
            return Task.FromResult(user is null ? null : Clone(user));
        }

        public Task<IEnumerable<UserAccount>> GetAll(int? limit, int? offset)
        {
            if (limit.HasValue && limit.Value <= 0) throw new ArgumentOutOfRangeException(nameof(limit));
            if (offset.HasValue && offset.Value < 0) throw new ArgumentOutOfRangeException(nameof(offset));

            var query = _store.Values
                .OrderBy(u => u.Username)
                .Select(Clone);

            if (offset.HasValue) query = query.Skip(offset.Value);
            if (limit.HasValue) query = query.Take(limit.Value);

            return Task.FromResult<IEnumerable<UserAccount>>(query.ToList());
        }

        public Task Update(UserAccount userAccount)
        {
            if (!_store.ContainsKey(userAccount.UserAccountId)) return Task.CompletedTask;
            _store[userAccount.UserAccountId] = Clone(userAccount);
            return Task.CompletedTask;
        }

        public Task Delete(Guid id)
        {
            _store.Remove(id);
            return Task.CompletedTask;
        }

        public Task<UserAccount?> GetByUsername(string username)
        {
            var user = _store.Values.FirstOrDefault(u => u.Username == username);
            return Task.FromResult(user is null ? null : Clone(user));
        }

        public Task<UserAccount?> GetByEmail(string email)
        {
            var user = _store.Values.FirstOrDefault(u => u.Email == email);
            return Task.FromResult(user is null ? null : Clone(user));
        }

        private static UserAccount Clone(UserAccount u) => new()
        {
            UserAccountId = u.UserAccountId,
            Username = u.Username,
            FirstName = u.FirstName,
            LastName = u.LastName,
            Email = u.Email,
            CreatedAt = u.CreatedAt,
            UpdatedAt = u.UpdatedAt,
            DateOfBirth = u.DateOfBirth,
            Timer = u.Timer is null ? null : (byte[])u.Timer.Clone(),
        };
    }
}
