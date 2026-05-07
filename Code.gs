// ✅ SHEET_ID configured for your Google Sheet
const SHEET_ID = '1glFnj8IyB2OEQJZ8SvPzx4ZKKctbjnb3pbc4VROs7EU';

function doGet(e) {
  return handleFormSubmission(e);
}

function doPost(e) {
  return handleFormSubmission(e);
}

function handleFormSubmission(e) {
  try {
    // Log the request for debugging
    const timestamp = new Date().toLocaleString('en-IN');
    
    // Get parameters from query string
    const params = e.parameter || {};
    const name = (params.name || '').trim();
    const email = (params.email || '').trim();
    const phone = (params.phone || '').trim();

    // Log what we received
    Logger.log('Received data - Name: ' + name + ', Email: ' + email + ', Phone: ' + phone);

    // Validate that we have at least some data
    if (!name || !email || !phone) {
      const errorMsg = 'Error: Missing required fields. Name: ' + name + ', Email: ' + email + ', Phone: ' + phone;
      Logger.log(errorMsg);
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: errorMsg,
        timestamp: timestamp
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Get the spreadsheet by ID
    Logger.log('Opening spreadsheet with ID: ' + SHEET_ID);
    const ss = SpreadsheetApp.openById(SHEET_ID);
    
    // Get or create the Responses sheet
    let sheet = ss.getSheetByName('Responses');
    
    if (!sheet) {
      Logger.log('Responses sheet not found. Creating new sheet...');
      sheet = ss.insertSheet('Responses');
      const headers = ['Timestamp', 'Name', 'Email', 'Phone'];
      sheet.appendRow(headers);
      
      // Bold the header row
      const range = sheet.getRange(1, 1, 1, headers.length);
      range.setFontWeight('bold');
      Logger.log('Responses sheet created with headers');
    }

    // Append new row with timestamp
    Logger.log('Appending data to sheet...');
    sheet.appendRow([timestamp, name, email, phone]);
    Logger.log('Data appended successfully');

    // Return success response
    const successResponse = {
      success: true,
      message: 'Form submitted successfully',
      timestamp: timestamp,
      data: {
        name: name,
        email: email,
        phone: phone
      }
    };
    
    Logger.log('Returning success: ' + JSON.stringify(successResponse));
    return ContentService.createTextOutput(JSON.stringify(successResponse))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Log the error with full details
    const errorResponse = {
      success: false,
      message: 'Server Error: ' + error.toString(),
      errorName: error.name,
      errorLine: error.lineNumber,
      errorStack: error.stack
    };
    
    Logger.log('ERROR OCCURRED: ' + JSON.stringify(errorResponse));
    
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function - run this in the Apps Script editor to verify setup
function testFormSubmission() {
  Logger.log('=== STARTING TEST ===');
  const testEvent = {
    parameter: {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+919876543210'
    }
  };
  
  const result = handleFormSubmission(testEvent);
  Logger.log('Test Result Content: ' + result.getContent());
  Logger.log('=== TEST COMPLETED ===');
  Logger.log('Check your Responses sheet for the test entry!');
}

// Manual test function to append directly to sheet (for testing sheet access)
function testDirectSheetAccess() {
  try {
    Logger.log('Testing direct sheet access...');
    const ss = SpreadsheetApp.openById(SHEET_ID);
    Logger.log('Sheet opened successfully');
    
    let sheet = ss.getSheetByName('Responses');
    if (!sheet) {
      Logger.log('Sheet not found, creating...');
      sheet = ss.insertSheet('Responses');
    }
    
    Logger.log('Appending test data...');
    const timestamp = new Date().toLocaleString('en-IN');
    sheet.appendRow([timestamp, 'Direct Test', 'direct@test.com', '+91 1234567890']);
    Logger.log('Test data appended successfully!');
  } catch (error) {
    Logger.log('ERROR in testDirectSheetAccess: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
  }
}
