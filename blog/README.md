## Prerequisites

* Hugo v0.20.7 or higher
* Pygments 2.2.0 or higher

## How to add new posts

```
## Create new article
$ hugo new post/my-awesome-new-post.md

## Serve pages locally
$ hugo server --theme=beautifulhugo

## Serve pages locally with drafts
$ hugo server --theme=beautifulhugo --buildDrafts

## Publish pages
$ hugo --theme=beautifulhugo
```

## How to deploy

```
## Build Docker image
$ docker build -t blog.mahata.org .

## (optional: Run it locally - access to localhost:8080)
$ docker run --rm -p 8080:80 blog.mahata.org

## Tag the image with YYYYMMDD tag
$ today=$(date "+%Y%m%d")
$ docker tag blog.mahata.org mahata/blog.mahata.org:$(echo $today)

## Push the image to Docker Hub
$ docker login -u mahata -p ...
$ docker push mahata/blog.mahata.org:$(echo $today)
```
