#!/usr/bin/env node

/**
 * Script de test pour vérifier la connexion Sentry
 * Usage: node scripts/test-sentry.js
 */

require('dotenv').config({ path: '.env.local' });

const SENTRY_CONFIG = {
  org: process.env.SENTRY_ORG || 'gearconnect',
  project: process.env.SENTRY_PROJECT || 'react-native',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  apiUrl: 'https://sentry.io/api/0',
};

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Diagnostic Sentry API Connection\n');

async function testSentryConnection(token, org, project) {
  const baseUrl = 'https://sentry.io/api/0';
  
  console.log(`📋 Configuration:`);
  console.log(`   - Organization: ${org}`);
  console.log(`   - Project: ${project}`);
  console.log(`   - Token: ${token.substring(0, 10)}...${token.substring(token.length - 4)}`);
  console.log(`   - Base URL: ${baseUrl}\n`);

  // Test 1: Vérifier l'organisation
  console.log('🧪 Test 1: Vérification de l\'organisation...');
  try {
    const orgUrl = `${baseUrl}/organizations/${org}/`;
    console.log(`   URL: ${orgUrl}`);
    
    const orgResponse = await fetch(orgUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (orgResponse.ok) {
      const orgData = await orgResponse.json();
      console.log(`   ✅ Organisation trouvée: ${orgData.name || org}`);
    } else {
      console.log(`   ❌ Erreur organisation: ${orgResponse.status} ${orgResponse.statusText}`);
      const errorText = await orgResponse.text();
      console.log(`   📄 Détails: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Erreur réseau: ${error.message}`);
    return false;
  }

  // Test 2: Vérifier le projet
  console.log('\n🧪 Test 2: Vérification du projet...');
  try {
    const projectUrl = `${baseUrl}/projects/${org}/${project}/`;
    console.log(`   URL: ${projectUrl}`);
    
    const projectResponse = await fetch(projectUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (projectResponse.ok) {
      const projectData = await projectResponse.json();
      console.log(`   ✅ Projet trouvé: ${projectData.name || project}`);
      console.log(`   📊 Plateforme: ${projectData.platform}`);
    } else {
      console.log(`   ❌ Erreur projet: ${projectResponse.status} ${projectResponse.statusText}`);
      const errorText = await projectResponse.text();
      console.log(`   📄 Détails: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Erreur réseau: ${error.message}`);
    return false;
  }

  // Test 3: Récupérer les issues
  console.log('\n🧪 Test 3: Récupération des issues...');
  try {
    const issuesUrl = `${baseUrl}/projects/${org}/${project}/issues/?limit=5`;
    console.log(`   URL: ${issuesUrl}`);
    
    const issuesResponse = await fetch(issuesUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (issuesResponse.ok) {
      const issuesData = await issuesResponse.json();
      console.log(`   ✅ Issues récupérées: ${issuesData.length} trouvées`);
      
      if (issuesData.length > 0) {
        console.log(`   📋 Première issue: ${issuesData[0].title || issuesData[0].culprit}`);
      }
    } else {
      console.log(`   ❌ Erreur issues: ${issuesResponse.status} ${issuesResponse.statusText}`);
      const errorText = await issuesResponse.text();
      console.log(`   📄 Détails: ${errorText}`);
    }
  } catch (error) {
    console.log(`   ❌ Erreur réseau: ${error.message}`);
  }

  console.log('\n✅ Tests terminés avec succès!');
  return true;
}

// Interface interactive
async function promptUser() {
  return new Promise((resolve) => {
    rl.question('🔑 Entrez votre token Sentry: ', (token) => {
      if (!token.trim()) {
        console.log('❌ Token requis!');
        process.exit(1);
      }
      
      rl.question('🏢 Organisation (coding-factory-classrooms): ', (org) => {
        const organization = org.trim() || 'coding-factory-classrooms';
        
        rl.question('📁 Projet (react-native): ', (project) => {
          const projectName = project.trim() || 'react-native';
          
          rl.close();
          resolve({ token: token.trim(), org: organization, project: projectName });
        });
      });
    });
  });
}

// Exécution principale
(async () => {
  try {
    const config = await promptUser();
    await testSentryConnection(config.token, config.org, config.project);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
})(); 