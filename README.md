# config-server

# shared-db
We use a shared db even though it's not recommended practice. This is to save RDS costs.

This project 'shared-db' manages the schema and migrations.

Each project has a .schema file in the prisma/ folder. 

Useful commands:
- npm run getschema - copy schema from shared-db project.
- npm run migrate - we should probably do this from the shared-db project
- npm run generate

Migrations