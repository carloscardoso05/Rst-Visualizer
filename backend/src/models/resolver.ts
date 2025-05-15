import { Resolver, Query } from '@nestjs/graphql';
import { User } from './User';

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello(): string {
    return 'Hello, GraphQL!';
  }

  @Query(() => [User])
  getUsers(): User[] {
    return [
      { id: 1, name: 'Lucas', email: 'lucas@example.com' },
      { id: 2, name: 'Mariana', email: 'mariana@example.com' },
    ];
  }
}
