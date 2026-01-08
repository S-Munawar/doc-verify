![Verified](https://img.shields.io/badge/Docs_Verified-Jan_08-2ea44f)

# My Library Documentation

Welcome to my library.

## Code Examples

### JavaScript - Fetch API
```javascript
// This fetches data from a real URL
const res = await fetch('https://jsonplaceholder.typicode.com/todos/1');
const data = await res.json();
console.log('Got data:', data);
```

### JavaScript - Simple
```javascript
console.log('Doc-Verify')
```

### JavaScript - Array Operations
```javascript
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log('Doubled:', doubled);
```

### TypeScript - Basic
```typescript
const message: string = 'Hello TypeScript';
console.log(message);
```

### TypeScript - Interface
```typescript
interface User {
  name: string;
  age: number;
}

const user: User = { name: 'Alice', age: 30 };
console.log(`User: ${user.name}, Age: ${user.age}`);
```

### Python - Hello World
```python
print("Hello from Python!")
```

### Python - List Comprehension
```python
numbers = [1, 2, 3, 4, 5]
squares = [x**2 for x in numbers]
print(f"Squares: {squares}")
```

### Python - Class
```python
class Calculator:
    def add(self, a, b):
        return a + b

calc = Calculator()
print(f"2 + 3 = {calc.add(2, 3)}")
```

### Go - Hello World
```go
package main

import "fmt"

func main() {
    fmt.Println("Hello from Go!")
}
```

### Go - Variables
```go
package main

import "fmt"

func main() {
    name := "Gopher"
    age := 10
    fmt.Printf("Name: %s, Age: %d\n", name, age)
}
```

### Rust - Hello World
```rust
fn main() {
    println!("Hello from Rust!");
}
```

### Rust - Variables
```rust
fn main() {
    let x = 5;
    let y = 10;
    println!("Sum: {}", x + y);
}
```

### Ruby - Hello World
```ruby
puts 'Hello from Ruby!'
```

### Ruby - Array
```ruby
fruits = ['apple', 'banana', 'cherry']
fruits.each { |f| puts f }
```

### Java - Hello World
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
    }
}
```

### C - Hello World
```c
#include <stdio.h>

int main() {
    printf("Hello from C!\n");
    return 0;
}
```

### C++ - Hello World
```cpp
#include <iostream>

int main() {
    std::cout << "Hello from C++!" << std::endl;
    return 0;
}
```

### Bash - Hello World
```bash
echo "Hello from Bash!"
```

### Bash - Variables
```bash
name="World"
echo "Hello, $name!"
```

### PHP - Hello World
```php
<?php
echo "Hello from PHP!\n";
?>
```

### Perl - Hello World
```perl
print "Hello from Perl!\n";
```

### Lua - Hello World
```lua
print("Hello from Lua!")
```

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
