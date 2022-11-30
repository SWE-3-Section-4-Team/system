# System
Developed by SWE (Section 3) Team 4:
- Abylaikhan Kazymbetov
- Gaukhar Satbekova
- Amirzhan Armandiyev
- Diar Demeubay
- Gulbakhram Niyazova

## Installation
- Make sure that you have node.js installed on your computer: get it from [here](https://nodejs.org/en/download/)
- Clone the repo
```bash
git clone git@github.com:SWE-3-Section-4-Team/system.git
```
- Install dependencies
```bash
npm ci
```
- Get a connection string to your Postgres DB. It should look something like that:
```
postgres://postgres:postgrespw@localhost:55000/system?schema=public
```
- Put in your `.env` file
- Get your S3 credentials. While development you can use [S3 Mock](https://github.com/adobe/S3Mock)
- Check if you have everything needed in your `.env` file. Use `.env-example` as an example :)
- Push database schema
```bash
npx prisma db push
```
- Seed the DB
```bash
node ./prisma/seed.mjs
```
- Start the project (in dev mode)
```bash
npm run dev
```
- You will be able to visit the system on `localhost:3000`
- Use dev admin data:
```
PIN: 000000000000
Password: 123123
```

## How do I deploy this?

Follow deployment guides for [Vercel](https://beta.create.t3.gg/en/deployment/vercel) and [Docker](https://beta.create.t3.gg/en/deployment/docker) for more information.
