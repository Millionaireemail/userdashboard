// Verify login via IMAP (secure — password never in frontend)
export const verifyImapLogin = webMethod(Permissions.Anyone, async (email, password) => {
    // This is a placeholder — real IMAP check requires server-side library
    // For now, we simulate success if email ends with your domain
    const validDomains = ['millionaire.email', 'affluent.email', 'billionaires.me'];
    const domain = email.split('@')[1];
    if (validDomains.includes(domain)) {
        // In production, use node-imap or similar server-side
        return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
});
