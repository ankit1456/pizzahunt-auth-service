function Login(username: string): string {
  const user = {
    lastName: 'developer'
  };

  const lastName = user['lastName'];

  return username + lastName;
}

Login('ankit');
