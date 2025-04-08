import bcrypt from 'bcrypt';

async function generateHash(password: string) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
}

async function main() {
  await generateHash('admin123');
  await generateHash('mentor123');
  await generateHash('student123');
}

main().catch(console.error); 