import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BorrowRecordsService } from './borrow-records.service';
import { BooksService } from '../books/books.service';
import { MembersService } from '../members/members.service';
import { BorrowRecord } from '../entities/borrow-record.entity';

describe('BorrowRecordsService', () => {
    let service: BorrowRecordsService;
    let repository: {
        findOne: jest.Mock;
        remove: jest.Mock;
        save: jest.Mock;
        create: jest.Mock;
        count: jest.Mock;
        find: jest.Mock;
        createQueryBuilder: jest.Mock;
    };

    beforeEach(async () => {
        repository = {
            findOne: jest.fn(),
            remove: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            count: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BorrowRecordsService,
                {
                    provide: getRepositoryToken(BorrowRecord),
                    useValue: repository,
                },
                {
                    provide: BooksService,
                    useValue: {
                        findOne: jest.fn(),
                        updateAvailableCopies: jest.fn(),
                    },
                },
                {
                    provide: MembersService,
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<BorrowRecordsService>(BorrowRecordsService);
    });

    it('does not delete a borrow record from storage when removal is requested', async () => {
        const borrowRecord = { id: 7, book_id: 1, return_date: null };
        repository.findOne.mockResolvedValue(borrowRecord);

        await expect(service.remove(7, { is_demo: false })).resolves.toBeUndefined();

        expect(repository.remove).not.toHaveBeenCalled();
    });

    it('persists borrow records even when the current user is a demo account', async () => {
        const borrowBookDto = { book_id: 1, member_id: 2, due_date: '2026-07-21' };
        repository.create.mockReturnValue({ ...borrowBookDto, borrow_date: new Date() });
        repository.save.mockResolvedValue({ id: 12, ...borrowBookDto });
        (service as any).booksService.findOne = jest.fn().mockResolvedValue({ available_copies: 2 });
        (service as any).membersService.findOne = jest.fn().mockResolvedValue({ id: 2 });

        const result = await service.borrowBook(borrowBookDto, { is_demo: true });

        expect(repository.save).toHaveBeenCalled();
        expect(result.id).toBe(12);
    });
});
