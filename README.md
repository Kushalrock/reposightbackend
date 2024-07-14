
# Reposight Backend 

Welcome to Reposight Backend Documentation! This guide will walk you through setting up and running the backend infrastructure for Reposight, a platform designed to simplify the process of finding open-source projects to contribute to.

## Backend Stack

Reposight Backend utilizes the following technologies:

| Technology   | Description                                   |
|--------------|-----------------------------------------------|
| Redis        | In-memory data structure store for caching    |
| Cassandra    | Distributed NoSQL database for scalable storage|
| Docker       | Containerization platform for seamless deployment|
| Node.js      | JavaScript runtime environment for backend development|
| Express.js   | Web application framework for Node.js         |
| Zustand      | State management library for React applications|

## Getting Started

To set up the Reposight Backend, follow these steps:

1. Clone the Reposight Backend repository from GitHub.
2. Ensure that Docker and other build essential tools are installed on your system.
3. Navigate to the cloned repository and run the following commands:
   ```
   docker-compose up -d
   docker ps -a # Note the container ID
   docker exec -it CONTAINER_ID cqlsh
   ```
4. Inside the CQL shell, create the necessary tables by executing the provided CQL commands:

   ```
   CREATE KEYSPACE reposight WITH REPLICATION = {'class': 'SimpleStrategy', 'replication_factor': 1};
   
   CREATE TABLE reposight.issues (
       repo_id text,
       issue_id text,
       issue_title text,
       difficulty text,
       issue_url text,
       status text,
       PRIMARY KEY (repo_id, issue_id)
   );
   
   CREATE TABLE reposight.ratings (
       repo_id text,
       user_id text,
       community_rating int,
       issue_classification_rating int,
       rating text,
       PRIMARY KEY (repo_id, user_id)
   );
   
   CREATE TABLE reposight.repos (
       repo_id text PRIMARY KEY,
       avg_ratings float,
       repo_desc text,
       repo_name text,
       repo_url text,
       sum_of_community_ratings int,
       sum_of_issue_classification_ratings int,
       total_community_ratings int,
       total_issue_classification_ratings int,
       tags set<text>
   );
   ```

5. After creating the tables, run the following commands to set up the environment:
   ```
   sudo npm i pm2 -g
   sudo npm i nodemon -g
   ```

6. Clone the other two Reposight repositories for frontend and app.

7. Navigate to each repository and run `npm i` to install dependencies.

8. Finally, start the backend server by running:
   ```
   pm2 start --name=website npm -- start
   ```
   Replace "website" with "frontend" or "app" depending on which part of the backend you are working on.

## Additional Notes

- For working with the GitHub bot, refer to the Probot documentation.
- Ensure that all repositories are properly configured and dependencies are installed before starting the backend server.

Congratulations! You have successfully set up the Reposight Backend. You can now start contributing to the project and improving the platform for the open-source community.
