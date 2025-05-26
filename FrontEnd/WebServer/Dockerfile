# Dockerfile for React client

# Build OS and node + npm

FROM node:14.17.3-buster

#Install kerberos client packages and make krb5.conf file
RUN apt-get update -y
RUN echo '[libdefaults]\n        default_realm = YOUR-DOMAIN.COM\n\n\n[realms]\n        YOUR-DOMAIN.COM = {\n                kdc = addc-1.your-domain.com\n                kdc = KBR5-SERV.your-domain.com\n                admin_server = KBR5-SERV.your-domain.com\n        }' > /etc/krb5.conf
RUN apt-get -y -qq install krb5-user libpam-krb5 libpam-ccreds libkrb5-dev


#Set locale ru_RU.UTF-8
RUN apt-get update && apt-get install -y locales && rm -rf /var/lib/apt/lists/*
RUN localedef -i ru_RU -c -f UTF-8 -A /usr/share/locale/locale.alias ru_RU.UTF-8

ENV LANG=ru_RU.UTF-8

# Working directory for the app
WORKDIR /webapps

# copy local files to app folder
COPY . .

###  Installing dependencies
RUN npm install -qy
RUN npm run build

EXPOSE 8000
