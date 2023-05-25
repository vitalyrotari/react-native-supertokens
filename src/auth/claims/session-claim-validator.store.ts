import { ClaimValidator } from "../auth.types";

export class SessionClaimValidatorStore {
  private static claimValidatorsAddedByOtherRecipes: ClaimValidator[] = [];

  static addClaimValidatorFromOtherRecipe = (builder: ClaimValidator) => {
    SessionClaimValidatorStore.claimValidatorsAddedByOtherRecipes.push(builder);
  };

  static getClaimValidatorsAddedByOtherRecipes = (): ClaimValidator[] => {
    return SessionClaimValidatorStore.claimValidatorsAddedByOtherRecipes;
  };
}
