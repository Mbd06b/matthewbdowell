def deployToEnvironment(String namespace, String deploymentName,
                         String manifestPath, String imageTag) {
    def outputFile = manifestPath.replace('.yaml', '.rendered.yaml')

    sh """
        sed -e 's|IMAGE_TAG_PLACEHOLDER|${imageTag}|g' \
            -e 's|DEPLOY_VERSION_PLACEHOLDER|${imageTag}|g' \
            ${manifestPath} > ${outputFile}
    """

    def remaining = sh(script: "grep -c '_PLACEHOLDER' ${outputFile} || true",
                       returnStdout: true).trim()
    if (remaining != '0') {
        error "Unresolved placeholders in ${outputFile}!"
    }

    sh "kubectl apply -f ${outputFile}"
    sh "kubectl rollout restart deployment/${deploymentName} -n ${namespace}"
    sh "kubectl rollout status deployment/${deploymentName} -n ${namespace} --timeout=300s"
}

pipeline {
    agent {
        kubernetes {
            cloud 'kubernetes'
            yaml '''
apiVersion: v1
kind: Pod
spec:
  serviceAccountName: jenkins-deployer
  nodeSelector:
    node-type: edge
  volumes:
    - name: containerd-sock
      hostPath:
        path: /var/snap/microk8s/common/run/containerd.sock
        type: Socket
    - name: buildkit-run
      emptyDir: {}
    - name: maven-settings-volume
      configMap:
        name: ghmbd06b-maven-settings
  containers:
    - name: builder
      image: harbor.ethosengine.com/ethosengine/ci-builder:latest
      command: [cat]
      tty: true
      resources:
        requests:
          ephemeral-storage: "2Gi"
        limits:
          ephemeral-storage: "5Gi"
      volumeMounts:
        - name: containerd-sock
          mountPath: /run/containerd/containerd.sock
        - name: buildkit-run
          mountPath: /run/buildkit
    - name: buildkitd
      image: moby/buildkit:v0.12.5
      securityContext:
        privileged: true
      args:
        - --addr
        - unix:///run/buildkit/buildkitd.sock
        - --oci-worker=true
        - --containerd-worker=false
      volumeMounts:
        - name: containerd-sock
          mountPath: /run/containerd/containerd.sock
        - name: buildkit-run
          mountPath: /run/buildkit
    - name: maven
      image: maven:3.9.9-eclipse-temurin-21
      command: [cat]
      tty: true
      volumeMounts:
        - name: maven-settings-volume
          mountPath: /usr/share/maven/ref/settings.xml
'''
        }
    }

    environment {
        IMAGE_TAG = "${env.BRANCH_NAME}-${env.BUILD_NUMBER}"
        FULL_IMAGE = "harbor.ethosengine.com/ethosengine/mbdsite:${env.BRANCH_NAME}-${env.BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                container('builder') {
                    checkout scm
                }
            }
        }

        stage('Lint') {
            steps {
                container('maven') {
                    script {
                        sh 'mvn clean compile -ntp'
                        withSonarQubeEnv('ee-sonarqube') {
                            sh '''mvn verify sonar:sonar \
                                -Dsonar.java.binaries=target/classes \
                                -Dsonar.sources=src/main/java,src/main/webapp \
                                -Dsonar.javascript.node=node \
                                -Dsonar.html.file.suffixes=.html,.xhtml,.jsf,.jsp \
                                -Dsonar.css.file.suffixes=.css,.less,.scss'''
                        }
                    }
                }
            }
        }

        stage('Build Image') {
            steps {
                container('builder') {
                    sh """
                        BUILDKIT_HOST=unix:///run/buildkit/buildkitd.sock \
                        nerdctl -n k8s.io build \
                            -t ${FULL_IMAGE} \
                            -f Dockerfile .
                    """
                }
            }
        }

        stage('Push to Harbor') {
            steps {
                container('builder') {
                    withCredentials([usernamePassword(
                        credentialsId: 'harbor-robot-registry',
                        usernameVariable: 'HARBOR_USERNAME',
                        passwordVariable: 'HARBOR_PASSWORD'
                    )]) {
                        sh '''
                            echo $HARBOR_PASSWORD | nerdctl -n k8s.io login harbor.ethosengine.com \
                                -u $HARBOR_USERNAME --password-stdin

                            nerdctl -n k8s.io push ''' + "${FULL_IMAGE}"
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                container('builder') {
                    script {
                        deployToEnvironment('ethosengine', 'mbdsite',
                            'deployment.yaml', IMAGE_TAG)
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline passed. Image: ${FULL_IMAGE}"
        }
        failure {
            echo 'Pipeline failed. Check stage logs for details.'
        }
    }
}
