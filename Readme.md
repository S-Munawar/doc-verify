# My Library Documentation

Welcome to my library.

## Code
Here is an example of how to use my library:

```javascript
console.log('Doc-Verify')
```

```python
print('Doc-Verify')
```

```typescript
console.log('Doc-Verify')
```

# My API

Here is how you confirm a payment:

```javascript
// This usually fails because 'stripe' is not defined!
const payment = await stripe.paymentIntents.create({
  amount: 2000,
  currency: 'usd',
});

console.log('Payment created:', payment.amount);
```