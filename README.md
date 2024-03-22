<!-- docker run --rm -it -v $(pwd):/user/src/app -v /usr/src/app/node_modules --env-file $(pwd)/.env -p 5000:5000 -e NODE_ENV=development auth-service:dev -->

<!--  docker run  --name pizzahunt-auth-service-db -e POSTGRES_USER=root -e POSTGRES_PASSWORD=postgres -v pizzahunt-auth-service-data:/var/lib/postgresql/data -p 5432:5432 -d postgres  -->

<!--docker exec -it <container_name> psql -U root -> in docker container-->

<!-- npm run migration:generate -- src/migration/migration -d src/config/data-source.ts -->
<!-- npm run migration:run -- -d src/config/data-source.ts -->
<!-- npm run migration:create src/migration/migrate_name -->

# Pizzahunt Auth Service

Authentication service for full stack food delivery app(pizzahunt).
