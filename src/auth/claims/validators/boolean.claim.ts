import { PrimitiveClaim } from "./primitive.claim";
import type { PrimitiveClaimConfig } from "./primitive.claim";
import type { ClaimValidator } from "../../auth.types";

type BooleanValidators = {
  isTrue: (maxAge?: number) => ClaimValidator;
  isFalse: (maxAge?: number) => ClaimValidator;
};

export class BooleanClaim extends PrimitiveClaim<boolean> {
  constructor(config: PrimitiveClaimConfig) {
    super(config);
  }

  get validators(): PrimitiveClaim<boolean>["validators"] & BooleanValidators {
    return {
      ...super.validators,
      isTrue: (maxAge?: number) => this.validators.hasValue(true, maxAge),
      isFalse: (maxAge?: number) => this.validators.hasValue(false, maxAge),
    };
  }
}
