# Mini_projet 
Chat serveur avec MongoDB et Redis 

# Objectifs du projet 
L'objectif de ce projet est de repartir de bases existantes : 
https://blog.bini.io/developper-une-application-avec-socket-io/
- Et de l'augmenter afin de prendre en considération les éléments suivants : 
- Connaître quels sont les utilisateurs connectés et les afficher (en utilisant Redis)
- Stocker l'ensemble des messages dans MongoDB
- Utiliser le ReplicaSet pour permettre une meilleure tolérance aux pannes
- Pouvoir afficher une conversation précédente entre deux utilisateurs
- Sortir des requêtes pertinentes : utilisateur le plus sollicité, celui qui communique le plus, etc.

# Realisation du projet 
Ce projet tres intéressant à  permis de découvrir et à manipuler les techniques des bases de données distribuées. En effet dans ce projet l'on utilise Redis pour gérer les session des utilisateurs et MongoDB pour stocker les messages. 
On apprend aussi à executer des commandes basiques pour interroger les differentes bases de données. 

# Lancement du projet (Mac OS) 
- Installation de Redis.
- Installation de MongoDB
- Installation de Robo3T
- Lancement de Redis (redis-server) et s'assurer que le serveur est en attente de connexions. 
- Ouvrir le projet et exécuter la commande : node server.js dans le terminal 
Nb : il pourrait vous être démandé d'installer les modules necessaires au projet: express; mongoose...
- Ouvrir son navigateur et aller à : http://localhost:3000 
- Créer un nom d'utilisateur et choisir une salle de conversation (Facebook, Insatgram ou Whatsapp)
- L'utilisateur peut envoyer et recevoir des messages dans les differentes salles. 

# Bases de données 
- Ouvrir Robo3T et se connecter au serveur localhost: 27017
- Ouvrir la collection messages pour verifier que les messages ont bien été envoyées. 
- Ouvrir le fichier dump.rdb pour verifier les données des utilisateurs dans Redis

# Commandes pour interroger MongoDB 
- Afficher tous les messages : db.getCollection('messages').find({})

- Afficher les messages d'un utilisateur "test" : db.getCollection('messages').find({de:"test"}).pretty()

- Afficher le nombre de messages d'un utilisateur "test" :db.getCollection('messages').find({de:"test"}).count()

- Afficher les messages d'un utilisateur "test" dans la salle"1": db.getCollection('messages').find({de:"test",salle:"1"}).pretty()

- Afficher le nombre de messages d'un utilisateur "test" dans la salle"1": 
db.getCollection('messages').find({de:"test",salle:"1"}).count()

# Amélioration en cours : 
- Mise en place de ReplicaSet 
- Finaliser les requêtes à utiliser avec Postman. 
- Les commandes MongoDb plus complexes : utilisateur le plus sollicité, celui qui communique le plus, etc...
