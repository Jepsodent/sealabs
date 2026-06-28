import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator"



export function IsFutureDate(validationOption?: ValidationOptions){
    return function (object: object, propertyName:string){
        registerDecorator({
            name: 'IsFutureDate',
            target: object.constructor,
            propertyName,
            options: validationOption,
            validator: {
                validate(value:any){
                    if(!value) return false;
                    const date = new Date(value)
                    const now = new Date()

                    return date.getTime() > now.getTime()
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be a future date`
                },
                }
            })
    }
}