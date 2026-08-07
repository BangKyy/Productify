import { chakra, ChakraProvider, defaultSystem } from '@chakra-ui/react';

console.log('chakra factory:', typeof chakra);
const TestButton = chakra('button');
console.log('TestButton component:', typeof TestButton);
console.log('defaultSystem:', Boolean(defaultSystem));
