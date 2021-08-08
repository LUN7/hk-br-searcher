# Procedure

1. The problem in this Exercise is quite straight forward
2. I would first try out puppeteer to see how it works
3. And then try to make I solution prototype
4. Next, I would write some unit tests and redesign the program 
5. Finally, I would refactor my prototype to make it pass all the tests
6. After all, If I have time I would turn the program into a api with a simple UI for fun.

# Design of the program
The scrapper would be a class with the following interface. 
```
IBrnScrapper {
  constructor: (options: Options): void
  initialize: async(): void
  getBrnDetail: async(): IBrnDetail
  destroy: async(): void
}
``` 

# Unit testing 
1. Test if initialize promise could be resolved
2. Test if getBrnDetail return expected outcome
3. Test if the destroy promise could be resolved

# Setting up the env

1. puppeteer
2. jest (for unit testing)
3. Dockerfile and Compose to run the project
4. express.js (for fun)

# How to run the program
```
docker-compose up --build
```
1. Open localhost:8000/app with browser