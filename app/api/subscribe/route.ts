import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// Interface pour les abonnements
interface Subscription {
  id: string;
  email: string;
  createdAt: string;
  verified: boolean;
  types: string[];
}

// Chemin vers le fichier des abonnements (en production, utiliser une vraie DB)
const SUBSCRIPTIONS_FILE = path.join(process.cwd(), 'data', 'subscriptions.json');

// Créer le dossier data s'il n'existe pas
function ensureDataDirectory() {
  const dataDir = path.dirname(SUBSCRIPTIONS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Lire les abonnements existants
function getSubscriptions(): Subscription[] {
  ensureDataDirectory();
  
  try {
    if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
      const data = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading subscriptions file:', error);
  }
  
  return [];
}

// Sauvegarder les abonnements
function saveSubscriptions(subscriptions: Subscription[]) {
  ensureDataDirectory();
  
  try {
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2));
  } catch (error) {
    console.error('Error saving subscriptions file:', error);
    throw new Error('Failed to save subscription');
  }
}

// Valider l'email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    // Validation
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Normaliser l'email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Vérifier les abonnements existants
    const subscriptions = getSubscriptions();
    const existingSubscription = subscriptions.find(sub => sub.email === normalizedEmail);
    
    if (existingSubscription) {
      return NextResponse.json(
        { message: 'Email already subscribed' },
        { status: 200 }
      );
    }

    // Créer un nouvel abonnement
    const newSubscription: Subscription = {
      id: Math.random().toString(36).substr(2, 9),
      email: normalizedEmail,
      createdAt: new Date().toISOString(),
      verified: true, // Pour simplifier, on considère directement vérifié
      types: ['incident', 'maintenance', 'resolution'],
    };

    // Ajouter à la liste et sauvegarder
    subscriptions.push(newSubscription);
    saveSubscriptions(subscriptions);

    // En production, ici on enverrait un email de confirmation
    console.log(`New subscription: ${normalizedEmail}`);

    return NextResponse.json(
      { 
        message: 'Successfully subscribed to notifications',
        subscription: {
          id: newSubscription.id,
          email: newSubscription.email,
          createdAt: newSubscription.createdAt,
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error in subscription API:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Gérer les demandes de désabonnement
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const subscriptions = getSubscriptions();
    const filteredSubscriptions = subscriptions.filter(sub => sub.email !== normalizedEmail);
    
    if (filteredSubscriptions.length === subscriptions.length) {
      return NextResponse.json(
        { error: 'Email not found in subscriptions' },
        { status: 404 }
      );
    }

    saveSubscriptions(filteredSubscriptions);
    
    return NextResponse.json(
      { message: 'Successfully unsubscribed' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in unsubscription API:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Obtenir la liste des abonnés (pour les administrateurs)
export async function GET(request: NextRequest) {
  try {
    // Dans une vraie application, il faudrait vérifier l'authentification admin
    const subscriptions = getSubscriptions();
    
    // Retourner seulement les informations publiques
    const publicSubscriptions = subscriptions.map(sub => ({
      id: sub.id,
      email: sub.email.replace(/(.{2}).*@/, '$1***@'), // Masquer partiellement l'email
      createdAt: sub.createdAt,
      verified: sub.verified,
      types: sub.types,
    }));

    return NextResponse.json({
      total: subscriptions.length,
      subscriptions: publicSubscriptions,
    });

  } catch (error) {
    console.error('Error getting subscriptions:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 