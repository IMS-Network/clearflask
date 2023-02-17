FROM node:fermium-bullseye-slim
EXPOSE 80 3000
WORKDIR /srv/clearflask-connect
CMD ./start.sh
ADD ROOT/ /srv/clearflask-connect
