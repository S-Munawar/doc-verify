![Verified](https://img.shields.io/badge/Docs_Verified-Jan_08-2ea44f)

# Doc Verify Examples

Below are small, self-contained code samples you can use to validate that doc-verify correctly parses and executes fenced snippets across languages. Run `pnpm dv examples.md` (or `npx doc-verify examples.md`) from the repo root to execute them.

```ts
// ts
export function add(a: number, b: number) {
  return a + b;
}

// if (add(2, 3) !== 5) throw new Error('ts add failed');
// ```

// ```js
// // js
// function greet(name) {
//   return `hello ${name}`;
// }

// if (greet('world') !== 'hello world') throw new Error('js greet failed');
// ```

// ```python
// # python
// def area(width: int, height: int) -> int:
// 	return width * height

// assert area(3, 4) == 12, 'python area failed'
// ```

// ```bash
// # bash
// sum=$((2 + 3))
// [ "$sum" -eq 5 ] || { echo "bash sum failed"; exit 1; }
// ```

// ```go
// // go
// package main

// import (
// 	"fmt"
// )

// func add(a, b int) int { return a + b }

// func main() {
// 	if add(2, 3) != 5 {
// 		panic("go add failed")
// 	}
// 	fmt.Println("ok")
// }
// ```

// ```rust
// // rust
// fn main() {
// 	fn add(a: i32, b: i32) -> i32 { a + b }
// 	assert_eq!(add(2, 3), 5, "rust add failed");
// }
// ```

// ```ruby
// # ruby
// def add(a, b)
//   a + b
// end

// raise 'ruby add failed' unless add(2, 3) == 5
// ```

// ```java
// // java
// public class Main {
// 	static int add(int a, int b) { return a + b; }

// 	public static void main(String[] args) {
// 		if (add(2, 3) != 5) throw new RuntimeException("java add failed");
// 		System.out.println("ok");
// 	}
// }
// ```

// ```c
// // c
// #include <stdio.h>
// #include <stdlib.h>

// int add(int a, int b) { return a + b; }

// int main(void) {
// 	if (add(2, 3) != 5) {
// 		fprintf(stderr, "c add failed\n");
// 		return EXIT_FAILURE;
// 	}
// 	return EXIT_SUCCESS;
// }
// ```

// ```cpp
// // cpp
// #include <stdexcept>

// int add(int a, int b) { return a + b; }

// int main() {
// 	if (add(2, 3) != 5) throw std::runtime_error("cpp add failed");
// }
// ```

// ```php
// <?php
// // php
// function add($a, $b) {
// 	return $a + $b;
// }

// if (add(2, 3) !== 5) {
// 	throw new Exception('php add failed');
// }
// ```

// ```perl
// # perl
// sub add { return $_[0] + $_[1]; }
// die "perl add failed" unless add(2, 3) == 5;
// ```

// ```lua
// -- lua
// local function add(a, b) return a + b end
// if add(2, 3) ~= 5 then error('lua add failed') end
// ```

// ```markdown
// This block should be skipped by execution; it is here to confirm that non-code fences remain untouched.
// ```
