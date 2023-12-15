docker run --rm -it -v $(pwd):/user/src/app -v /usr/src/app/node_modules --env-file $(pwd)/.env -p 5000:5000 -e NODE_ENV=development auth-service:dev
