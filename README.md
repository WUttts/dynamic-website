
# Getting Started

This template is designed to be installed inside a Codio box. To to this, open the terminal and run the following command:

```
$ curl -sL https://bit.ly/3yKYBTg | bash
```

This will configure the box ready for you to start development.

> The process can take up to 15 min. Make sure you don't close the browser tab _or let your computer go into sleep mode_.

To run the server:

```shell
$ deno run --allow-all --unstable index.js
```

The website database has been added with a root password of `p455w0rd` and a single **accounts** table which is pre-configured with a single account:

username: `doej`

password: `p455w0rd`

There is a secure page called **Foo Bar** which can be accessed at the `/foo` route. You will need to delete this and replace with your own secure content.

# Support Videos

https://youtu.be/X38dYaNH-HA

https://youtu.be/gdvKwBpNU7A

## Pushing to GitHub

If you can't push to the University GitHub server (you are not prompted for the username/password and the connection times out) please run the following command which will print the Codio box external IP address and send this to your module leader.

```
$ dig +short myip.opendns.com @resolver1.opendns.com
```
