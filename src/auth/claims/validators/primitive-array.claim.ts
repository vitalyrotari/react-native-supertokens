import { PrimitiveClaim } from "./primitive.claim";

export class PrimitiveArrayClaim<TValue> extends PrimitiveClaim<TValue> {
  get validators() {
    return {
      ...super.validators,

      includes: this.createValidatorRule(
        (actualValue, exprectedValue) =>
          Array.isArray(actualValue) && actualValue.includes(exprectedValue)
      ),

      excludes: this.createValidatorRule(
        (actualValue, exprectedValue) =>
          !Array.isArray(actualValue) || !actualValue.includes(exprectedValue)
      ),

      includesAll: this.createValidatorRule((actualValue, exprectedValue) => {
        const claimSet = new Set((actualValue ?? []) as TValue[]);
        return (
          Array.isArray(exprectedValue) &&
          exprectedValue.every((v) => claimSet.has(v))
        );
      }),

      includesAny: this.createValidatorRule((actualValue, exprectedValue) => {
        const claimSet = new Set((actualValue ?? []) as TValue[]);
        return (
          Array.isArray(exprectedValue) &&
          exprectedValue.some((v) => claimSet.has(v))
        );
      }),

      excludesAll: this.createValidatorRule((actualValue, exprectedValue) => {
        const claimSet = new Set((actualValue ?? []) as TValue[]);
        return (
          !Array.isArray(exprectedValue) ||
          !exprectedValue.some((v) => claimSet.has(v))
        );
      }),
    };
  }
}
