FROM node:14.21.3-bullseye-slim
EXPOSE 80 3000
WORKDIR /srv/clearflask-connect
CMD ./start.sh
ADD ROOT/ /srv/clearflask-connect
