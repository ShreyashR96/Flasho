import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sendDeletionReceivedEmail, sendAccountDeletedEmail } from './server/mailHandler.js'
import { 
  getAllDeletionRequests, 
  saveDeletionRequest, 
  approveDeletionRequest, 
  rejectDeletionRequest, 
  removeDeletionRequest 
} from './server/deletionStore.js'

function mailApiPlugin() {
  return {
    name: 'mail-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';

        // 1. GET /api/account-deletion-requests -> List all requests from persistent disk
        if (url === '/api/account-deletion-requests' && req.method === 'GET') {
          try {
            const list = getAllDeletionRequests();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(list));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: err.message }));
          }
        }

        // 2. POST /api/account-deletion-requests -> Add/Save new request to persistent disk
        if (url === '/api/account-deletion-requests' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const saved = saveDeletionRequest(data);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, request: saved }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // 3. POST /api/account-deletion-requests/:id/approve -> Mark completed on disk & send email
        if (url.startsWith('/api/account-deletion-requests/') && url.endsWith('/approve') && req.method === 'POST') {
          const parts = url.split('/');
          const id = parts[3]; // /api/account-deletion-requests/:id/approve
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const updated = approveDeletionRequest(id, data.admin_notes || data.adminNotes);

              const recipientEmail = data.email || updated?.email;
              const recipientName = data.name || updated?.name;
              const recipientPhone = data.phone || updated?.phone;

              // Immediately respond to client so UI is instantaneous!
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ 
                success: true, 
                message: 'Account deleted successfully', 
                request: updated 
              }));

              // Send email in background without blocking response
              if (recipientEmail) {
                sendAccountDeletedEmail({
                  email: recipientEmail,
                  name: recipientName,
                  phone: recipientPhone
                }).catch(err => {
                  console.error('🔴 [Mail Error in Background]:', err.message);
                });
              }
            } catch (err) {
              console.error('🔴 [Approve Error]:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // 4. POST /api/account-deletion-requests/:id/reject -> Mark rejected on disk
        if (url.startsWith('/api/account-deletion-requests/') && url.endsWith('/reject') && req.method === 'POST') {
          const parts = url.split('/');
          const id = parts[3];
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const updated = rejectDeletionRequest(id, data.reason || data.admin_notes);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, request: updated }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // 5. DELETE /api/account-deletion-requests/:id -> Permanently remove record from disk
        if (url.startsWith('/api/account-deletion-requests/') && req.method === 'DELETE') {
          const parts = url.split('/');
          const id = parts[3];
          try {
            const removed = removeDeletionRequest(id);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: removed }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: err.message }));
          }
        }

        // 6. Direct mail endpoint: /api/send-deletion-mail
        if (url === '/api/send-deletion-mail' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const { email, name, phone, requestId, type } = data;

              if (!email) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: 'Recipient email is required' }));
              }

              // Fast response to caller
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: `Email dispatched to ${email}` }));

              // Perform email dispatch
              if (type === 'received') {
                sendDeletionReceivedEmail({ email, name, phone, requestId }).catch(err => {
                  console.error('🔴 [Mail Dispatch Error]:', err.message);
                });
              } else {
                sendAccountDeletedEmail({ email, name, phone }).catch(err => {
                  console.error('🔴 [Mail Dispatch Error]:', err.message);
                });
              }
            } catch (err) {
              console.error('🔴 [Vite Mail Plugin] Email error:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), mailApiPlugin()],
})
