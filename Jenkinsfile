pipeline {
        agent {
    	kubernetes {
            cloud 'kubernetes'
            yaml '''
    apiVersion: v1
    kind: Pod
    spec:
     nodeSelector:
        node-type: edge
     containers:
     - name: maven
       image: maven:3.6.3-jdk-11
       command:
       - cat
       tty: true
       volumeMounts:
       - name: maven-settings-volume
         mountPath: /usr/share/maven/ref/settings.xml
     - name: maven-jdk21
       image: maven:3.9.9-eclipse-temurin-21
       command:
       - cat
       tty: true
       volumeMounts:
       - name: maven-settings-volume
         mountPath: /usr/share/maven/ref/settings.xml
     volumes:
      - name: maven-settings-volume
        configMap:
         # Provide the name of the ConfigMap containing the files you want
         # to add to the container
         name: ghmbd06b-maven-settings
    '''
        }
    }
    
    stages {

        stage('Checkout') {

            steps {
              container('maven'){
        	      script {
                        checkout scm      
                     }
              }
            }
        }
        
        stage('Lint') {
            steps {
              container('maven-jdk21'){
        	       script {
                     echo 'Output Directory Structure before compile'
                     sh 'ls -R' //output what's being seen here
                     sh 'mvn clean compile -ntp'
                     echo 'Output Directory Structure After compile'
                     sh 'ls -R' //output what's being seen here
                  withSonarQubeEnv('ee-sonarqube') {
                    sh 'mvn verify sonar:sonar \
                        -Dsonar.java.binaries=target/classes \
                        -Dsonar.sources=src/main/java,src/main/webapp \
                        -Dsonar.javascript.node=node \
                        -Dsonar.html.file.suffixes=.html,.xhtml,.jsf,.jsp \
                        -Dsonar.css.file.suffixes=.css,.less,.scss'                  }
                 }
              }
            }
        }

    }

    post {
        success {
            echo 'Linting passed, review branch has been merged into main.'
        }
        failure {
            echo 'Linting failed or there was an error, review branch has not been merged into main.'
        }
    }
}
