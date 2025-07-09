import { CreateUserUseCase } from './CreateUserUseCase';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { TCreateUserUseCaseInput, TCreateUserUseCaseOutput } from './TCreateUserUseCase';
import { User } from '@domain/models/User';

// Mock IUserRepository
const mockFindByClientId = jest.fn();
const mockSave = jest.fn();
const mockUserRepository: IUserRepository = {
    findByClientId: mockFindByClientId,
    save: mockSave,
};

describe('CreateUserUseCase', () => {
    let useCase: CreateUserUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new CreateUserUseCase(mockUserRepository);
    });

    it('should create a new user if clientId does not exist', async () => {
        const input: TCreateUserUseCaseInput = { clientId: 'new-client-id', name: 'New User' };
        const createdUser: User = { id: 'new-user-id', clientId: 'new-client-id', name: 'New User', videos: [] };

        mockFindByClientId.mockResolvedValue(null); // User does not exist
        mockSave.mockResolvedValue(createdUser); // Save returns the created user

        const result = await useCase.execute(input);

        expect(mockFindByClientId).toHaveBeenCalledTimes(1);
        expect(mockFindByClientId).toHaveBeenCalledWith('new-client-id');
        expect(mockSave).toHaveBeenCalledTimes(1);
        expect(mockSave).toHaveBeenCalledWith({
            clientId: 'new-client-id',
            name: 'New User',
            videos: [],
        });
        expect(result).toEqual(createdUser);
    });

    it('should throw an error if user with clientId already exists', async () => {
        const input: TCreateUserUseCaseInput = { clientId: 'existing-client-id', name: 'Existing User' };
        const existingUser: User = { id: 'existing-user-id', clientId: 'existing-client-id', name: 'Existing User', videos: [] };

        mockFindByClientId.mockResolvedValue(existingUser); // User already exists

        await expect(useCase.execute(input)).rejects.toThrow(
            `User with clientId ${input.clientId} already exists.`,
        );
        expect(mockFindByClientId).toHaveBeenCalledTimes(1);
        expect(mockFindByClientId).toHaveBeenCalledWith('existing-client-id');
        expect(mockSave).not.toHaveBeenCalled(); // Save should not be called
    });
});
