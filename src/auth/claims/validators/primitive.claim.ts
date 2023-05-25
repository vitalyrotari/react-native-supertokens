import type { ClaimValidator, ClaimValidatoinResult } from "../../auth.types";

type ClaimValidatorRule<TValue> = (
  actualValue: unknown,
  exprectedValue: TValue
) => boolean;

export type PrimitiveClaimConfig = {
  id: string;
  refresh: () => Promise<void>;
  defaultMaxAgeInSeconds?: number;
};

export class PrimitiveClaim<TValue> {
  public readonly id: string;
  public readonly refresh: ClaimValidator["refresh"];
  public readonly defaultMaxAgeInSeconds?: number;

  constructor({ id, refresh, defaultMaxAgeInSeconds }: PrimitiveClaimConfig) {
    this.id = id;
    this.refresh = refresh;
    this.defaultMaxAgeInSeconds = defaultMaxAgeInSeconds;
  }

  getValueFromPayload(payload: unknown): TValue | undefined {
    return payload?.[this.id]?.v;
  }

  getLastFetchedTime(payload: unknown): number | undefined {
    return payload?.[this.id]?.t;
  }

  get validators() {
    return {
      hasValue: this.createValidatorRule(
        (actualValue, exprectedValue) => actualValue === exprectedValue
      ),
    };
  }

  protected createValidatorRule(rule: ClaimValidatorRule<TValue>) {
    return (
      value: TValue,
      maxAgeInSeconds = this.defaultMaxAgeInSeconds,
      id = this.id
    ): ClaimValidator => ({
      id,
      refresh: () => this.refresh(),
      shouldRefresh: (payload: unknown): boolean => {
        const payloadTime = payload?.[this.id]?.t ?? 0;

        return (
          this.getValueFromPayload(payload) === undefined ||
          (maxAgeInSeconds !== undefined &&
            payloadTime < Date.now() - maxAgeInSeconds * 1000)
        );
      },
      validate: (payload: unknown): ClaimValidatoinResult => {
        const claimValue = this.getValueFromPayload(payload);

        if (claimValue === undefined) {
          return {
            isValid: false,
            reason: {
              message: "Value does not exists",
              exprectedValue: value,
              actualValue: claimValue,
            },
          };
        }

        const ageInSeconds =
          (Date.now() - this.getLastFetchedTime(payload)) / 1000;

        if (maxAgeInSeconds !== undefined && ageInSeconds > maxAgeInSeconds) {
          return {
            isValid: false,
            reason: {
              message: "Expired",
              ageInSeconds,
              maxAgeInSeconds,
            },
          };
        }

        const isValid = rule(claimValue, value);

        if (isValid) {
          return { isValid };
        }

        return {
          isValid,
          reason: {
            message: "Unexpected value",
            exprectedValue: value,
            actualValue: claimValue,
          },
        };
      },
    });
  }
}
