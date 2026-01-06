# My Library Documentation

Welcome to my library.

## Code Examples

Here is an example of how to use my library in different languages:

### JavaScript
```javascript
console.log('Doc-Verify')
```

### Python
```python
print('Doc-Verify')
throw new error("API"):
```

### TypeScript
```typescript
console.log('Doc-Verify')
```

### Go
```go
package main

import "fmt"

func main() {
    fmt.Println("Doc-Verify")
}
```

<!-- ### Ruby
```ruby
puts 'Doc-Verify'
```

### Java
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Doc-Verify");
    }
}
```

### PHP
```php
<?php
echo "Doc-Verify\n";
?>
```

### Bash
```bash
echo "Doc-Verify"
```

### Rust
```rust
fn main() {
    println!("Doc-Verify");
}
```

### C
```c
#include <stdio.h>

int main() {
    printff("Doc-Verify\n");
    return 0;
}
```

### C++
```cpp
#include <iostream>

int main() {
    std::cout << "Doc-Verify" << std::endl;
    return 0;
}
```

### Perl
```perl
print "Doc-Verify\n";
```

### Lua
```lua
print("Doc-Verify")
``` -->

---

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