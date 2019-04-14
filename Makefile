#!make

DOCKER_IMAGE_NAME:=merge-bot:latest

build:
	@docker build -t $(DOCKER_IMAGE_NAME) .

develop:
	@docker run --rm -it -v $(PWD):/opt/bot -w /opt/bot --entrypoint sh $(DOCKER_IMAGE_NAME)
