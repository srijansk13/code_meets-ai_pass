import { spawn } from 'child_process';
import http from 'http';

const NUM_REQUESTS = 50;
const HOST = 'http://localhost:3000';

async function sendRequest(id, rollNumber) {
  const start = Date.now();
  try {
    const res = await fetch(`${HOST}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: `Load Tester ${id}`,
        roll_number: rollNumber, // Same roll number to test idempotency and collisions
        section: 'A',
        branch: 'CSE',
        year: '2nd Year',
        phone_number: '1234567890'
      })
    });
    
    const data = await res.json();
    return {
      id,
      status: res.status,
      time: Date.now() - start,
      data
    };
  } catch (err) {
    return {
      id,
      status: 'error',
      time: Date.now() - start,
      error: err.message
    };
  }
}

async function run() {
  console.log(`Starting load test with ${NUM_REQUESTS} concurrent requests...`);
  
  // Test 1: Idempotency (same roll number submitted multiple times concurrently)
  const rollNumber = `25${Date.now().toString().slice(-8)}`;
  console.log(`\n--- Test 1: Concurrent identical registrations (Roll: ${rollNumber}) ---`);
  
  const promises = [];
  for (let i = 0; i < NUM_REQUESTS; i++) {
    promises.push(sendRequest(i, rollNumber));
  }
  
  const results = await Promise.all(promises);
  
  let successes = 0;
  let alreadyRegistered = 0;
  let errors = 0;
  let tokens = new Set();
  
  for (const r of results) {
    if (r.status === 200) {
      if (r.data.already_registered) {
        alreadyRegistered++;
      } else {
        successes++;
      }
      if (r.data.participant?.qr_token) {
        tokens.add(r.data.participant.qr_token);
      }
    } else {
      errors++;
      console.error(`Request ${r.id} failed:`, r.status, r.data || r.error);
    }
  }
  
  console.log(`Total Requests: ${NUM_REQUESTS}`);
  console.log(`New Registrations: ${successes} (Should be exactly 1)`);
  console.log(`Already Registered Responses: ${alreadyRegistered} (Should be ${NUM_REQUESTS - 1})`);
  console.log(`Errors: ${errors} (Should be 0)`);
  console.log(`Unique Tokens Returned: ${tokens.size} (Should be exactly 1)`);
  
  // Test 2: Concurrent different registrations
  console.log(`\n--- Test 2: Concurrent different registrations ---`);
  const promises2 = [];
  // Generate unique 10-char roll numbers starting with 25
  const baseRoll2 = `25${Date.now().toString().slice(-6)}`;
  for (let i = 0; i < NUM_REQUESTS; i++) {
    promises2.push(sendRequest(i, `${baseRoll2}${i.toString().padStart(2, '0')}`));
  }
  
  const results2 = await Promise.all(promises2);
  let successes2 = 0;
  let errors2 = 0;
  let tokens2 = new Set();
  let backupCodes2 = new Set();
  
  for (const r of results2) {
    if (r.status === 200) {
      successes2++;
      if (r.data.participant?.qr_token) tokens2.add(r.data.participant.qr_token);
      if (r.data.participant?.backup_code) backupCodes2.add(r.data.participant.backup_code);
    } else {
      errors2++;
    }
  }
  
  console.log(`Total Requests: ${NUM_REQUESTS}`);
  console.log(`Successful Registrations: ${successes2}`);
  console.log(`Errors: ${errors2}`);
  console.log(`Unique Tokens: ${tokens2.size}`);
  console.log(`Unique Backup Codes: ${backupCodes2.size}`);
}

run().catch(console.error);
