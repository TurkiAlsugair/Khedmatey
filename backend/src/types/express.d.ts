import { GenerateTokenDto } from 'src/auth/dtos/generate-token.dto';

//extend the request object to include the user object (decoded token)
declare global {
    namespace Express {
        interface User extends GenerateTokenDto {}
    }   
}