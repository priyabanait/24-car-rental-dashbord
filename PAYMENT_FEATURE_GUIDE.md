# ZWITCH Payment Gateway - Quick Start

## 🚀 What's New?

Real-time bank payment processing for driver payouts using ZWITCH payment gateway!

## ✨ Key Features

- **Instant Transfers**: Process payments via IMPS (24x7 instant transfers)
- **Secure Processing**: Bank details validated before processing
- **Status Tracking**: Real-time payment status updates
- **Error Handling**: Clear error messages and failed payment handling

## 📋 Quick Setup (3 Steps)

### Step 1: Get ZWITCH Credentials
1. Visit [https://zwitch.io](https://zwitch.io)
2. Sign up for an account
3. Get your API Key and Secret from dashboard

### Step 2: Configure Backend
Add to `backend/.env`:
```env
ZWITCH_API_KEY=your_key_here
ZWITCH_API_SECRET=your_secret_here
```

### Step 3: Restart Backend
```bash
cd backend
npm start
```

## 🎯 How to Process a Payment

### Visual Guide:

```
┌─────────────────────────────────────────────────────────┐
│  Driver Payments Page                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Payment ID  │  Driver     │  Amount  │  Status  │ Actions│
│  ───────────────────────────────────────────────────────│
│  PAY001      │  John Doe   │  ₹5,000  │ Pending  │  [📤]  │ ← Click this!
│  PAY002      │  Jane Smith │  ₹3,500  │ Completed│  [🗑️]  │
│  PAY003      │  Bob Wilson │  ₹4,200  │ Failed   │  [📤]  │ ← Or this!
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**When you click the 📤 (Send) icon:**

```
┌──────────────────────────────────────────────────┐
│  Process Payment via ZWITCH                      │
├──────────────────────────────────────────────────┤
│                                                  │
│  💰 Payment Amount: ₹5,000                       │
│  📋 Payment Type: Weekly Payout                  │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │ Account Holder Name *                   │    │
│  │ [John Doe                          ]    │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │ Account Number *                        │    │
│  │ [1234567890                        ]    │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │ IFSC Code *                             │    │
│  │ [SBIN0001234                       ]    │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  ⚠️  Please verify bank details before          │
│      processing. This will initiate a           │
│      real-time IMPS transfer.                   │
│                                                  │
│  [Cancel]              [📤 Process Payment]     │
└──────────────────────────────────────────────────┘
```

## 🔄 Payment Flow

```
1. 📝 Fill Bank Details
        ↓
2. ✅ Validation
        ↓
3. 🔐 Secure API Call to ZWITCH
        ↓
4. 💸 IMPS Transfer Initiated
        ↓
5. ⏱️  Status: Processing...
        ↓
6. ✅ Status: Completed!
   (or ❌ Failed with reason)
```

## 🎨 UI Indicators

| Icon | Meaning |
|------|---------|
| 📤 | Process Payment (green) - Click to pay |
| 🔄 | Processing (blue, spinning) - Payment in progress |
| ✅ | Completed (green) - Payment successful |
| ⏱️ | Pending (yellow) - Awaiting processing |
| ❌ | Failed (red) - Payment failed |
| 🗑️ | Delete - Remove payment record |

## 💡 Tips

1. **Test First**: Use ZWITCH sandbox mode for testing
2. **Verify Details**: Double-check bank details before processing
3. **Check Balance**: Ensure ZWITCH wallet has sufficient balance
4. **Monitor Status**: Payment status updates automatically
5. **Handle Failures**: Failed payments can be retried with correct details

## 🔒 Security

- ✅ All API calls authenticated with JWT tokens
- ✅ Bank details validated on both frontend and backend
- ✅ ZWITCH credentials stored securely in environment variables
- ✅ Amount limits enforced (₹1 - ₹100,000)
- ✅ IFSC and account number pattern validation

## 📊 Payment Limits

| Limit Type | Value |
|------------|-------|
| Minimum Amount | ₹1 |
| Maximum Amount | ₹100,000 |
| Account Number Length | 9-18 digits |
| IFSC Format | XXXX0XXXXXX (11 chars) |

## 🐛 Common Issues

### "Payment gateway not configured"
**Fix**: Add ZWITCH credentials to backend/.env

### "Insufficient balance"
**Fix**: Fund your ZWITCH wallet

### "Invalid bank details"
**Fix**: Verify IFSC code and account number format

### Payment status stuck
**Fix**: Check backend logs or contact ZWITCH support

## 📚 Documentation

- 📖 Full Setup Guide: `ZWITCH_SETUP_GUIDE.md`
- 🔧 Backend API: `backend/routes/payments.js`
- 💻 Frontend Util: `src/utils/zwitchPayment.js`
- 🎨 UI Component: `src/pages/drivers/DriverPayments.jsx`

## 🤝 Support

Need help? Check:
1. `ZWITCH_SETUP_GUIDE.md` for detailed documentation
2. ZWITCH Docs: https://docs.zwitch.io/
3. Backend logs for error details

---

**Ready to process your first payment? 🚀**

1. Add ZWITCH credentials to `.env`
2. Restart backend server
3. Open Driver Payments page
4. Click 📤 on a pending payment
5. Fill bank details and hit Process Payment!
