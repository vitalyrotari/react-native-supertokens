import { BooleanClaim } from "./boolean.claim";
import type {
  ClaimValidator,
  IEmailVerificationRecipe,
} from "../../auth.types";

type EmailVerificationValidators = {
  isVerified: (
    refetchTimeOnFalseInSeconds?: number,
    maxAgeInSeconds?: number
  ) => ClaimValidator;
};

export class EmailVerificationClaim extends BooleanClaim {
  constructor(getRecipeImpl: () => IEmailVerificationRecipe) {
    super({
      id: "st-ev",
      refresh: async () => {
        await getRecipeImpl().isEmailVerified({});
      },
    });
  }

  get validators(): BooleanClaim["validators"] & EmailVerificationValidators {
    return {
      ...super.validators,
      isVerified: (
        refetchTimeOnFalseInSeconds = 10,
        maxAgeInSeconds = 300
      ) => ({
        id: this.id,
        refresh: this.refresh,
        shouldRefresh: (payload) => {
          const value = this.getValueFromPayload(payload);

          return (
            value === undefined ||
            this.getLastFetchedTime(payload)! <
              Date.now() - maxAgeInSeconds * 1000 ||
            (value === false &&
              this.getLastFetchedTime(payload)! <
                Date.now() - refetchTimeOnFalseInSeconds * 1000)
          );
        },
        validate: async (payload) => {
          const value = this.getValueFromPayload(payload);

          if (value === true) {
            return { isValid: true };
          }

          return {
            isValid: false,
            reason: {
              message: "wrong value",
              expectedValue: true,
              actualValue: value,
            },
          };
        },
      }),
    };
  }
}
