export class MezoAgentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MezoAgentError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class HourlyLimitExceededError extends MezoAgentError {
  public readonly currentSpent: string;
  public readonly attemptedAmount: string;
  public readonly hourlyLimit: string;

  constructor(currentSpent: string, attemptedAmount: string, hourlyLimit: string) {
    super(
      `Hourly velocity cap exceeded on Mezo. Spent: ${currentSpent} MUSD, Attempted: ${attemptedAmount} MUSD, Limit: ${hourlyLimit} MUSD.`
    );
    this.name = "HourlyLimitExceededError";
    this.currentSpent = currentSpent;
    this.attemptedAmount = attemptedAmount;
    this.hourlyLimit = hourlyLimit;
    Object.setPrototypeOf(this, HourlyLimitExceededError.prototype);
  }
}

export class DailyLimitExceededError extends MezoAgentError {
  public readonly currentSpent: string;
  public readonly attemptedAmount: string;
  public readonly dailyLimit: string;

  constructor(currentSpent: string, attemptedAmount: string, dailyLimit: string) {
    super(
      `Daily safety cap exceeded on Mezo. Spent: ${currentSpent} MUSD, Attempted: ${attemptedAmount} MUSD, Limit: ${dailyLimit} MUSD.`
    );
    this.name = "DailyLimitExceededError";
    this.currentSpent = currentSpent;
    this.attemptedAmount = attemptedAmount;
    this.dailyLimit = dailyLimit;
    Object.setPrototypeOf(this, DailyLimitExceededError.prototype);
  }
}

export class MaxPerTxExceededError extends MezoAgentError {
  public readonly attemptedAmount: string;
  public readonly maxPerTx: string;

  constructor(attemptedAmount: string, maxPerTx: string) {
    super(
      `Transaction amount ${attemptedAmount} MUSD exceeds the session key per-transaction cap of ${maxPerTx} MUSD.`
    );
    this.name = "MaxPerTxExceededError";
    this.attemptedAmount = attemptedAmount;
    this.maxPerTx = maxPerTx;
    Object.setPrototypeOf(this, MaxPerTxExceededError.prototype);
  }
}

export class PendingApprovalRequiredError extends MezoAgentError {
  public readonly attemptedAmount: string;
  public readonly threshold: string;

  constructor(attemptedAmount: string, threshold: string) {
    super(
      `Amount ${attemptedAmount} MUSD exceeds human approval threshold of ${threshold} MUSD. Transaction must be submitted via requestExecution().`
    );
    this.name = "PendingApprovalRequiredError";
    this.attemptedAmount = attemptedAmount;
    this.threshold = threshold;
    Object.setPrototypeOf(this, PendingApprovalRequiredError.prototype);
  }
}

export class SessionKeyRevokedError extends MezoAgentError {
  public readonly sessionKey: string;

  constructor(sessionKey: string) {
    super(`Session key ${sessionKey} has been REVOKED by the master owner. Execution rejected.`);
    this.name = "SessionKeyRevokedError";
    this.sessionKey = sessionKey;
    Object.setPrototypeOf(this, SessionKeyRevokedError.prototype);
  }
}

export class SessionKeyExpiredError extends MezoAgentError {
  public readonly expiryTimestamp: number;

  constructor(expiryTimestamp: number) {
    super(`Session key expired at ${new Date(expiryTimestamp * 1000).toISOString()}.`);
    this.name = "SessionKeyExpiredError";
    this.expiryTimestamp = expiryTimestamp;
    Object.setPrototypeOf(this, SessionKeyExpiredError.prototype);
  }
}

export class TargetNotWhitelistedError extends MezoAgentError {
  public readonly target: string;

  constructor(target: string) {
    super(`Target contract ${target} is not in the session key whitelist.`);
    this.name = "TargetNotWhitelistedError";
    this.target = target;
    Object.setPrototypeOf(this, TargetNotWhitelistedError.prototype);
  }
}

export class SelectorNotWhitelistedError extends MezoAgentError {
  public readonly target: string;
  public readonly selector: string;

  constructor(target: string, selector: string) {
    super(`Function selector ${selector} on target ${target} is not authorized for this session key.`);
    this.name = "SelectorNotWhitelistedError";
    this.target = target;
    this.selector = selector;
    Object.setPrototypeOf(this, SelectorNotWhitelistedError.prototype);
  }
}

export class AccountPausedError extends MezoAgentError {
  public readonly accountAddress: string;

  constructor(accountAddress: string) {
    super(`Smart account ${accountAddress} is currently PAUSED by owner or security guardian.`);
    this.name = "AccountPausedError";
    this.accountAddress = accountAddress;
    Object.setPrototypeOf(this, AccountPausedError.prototype);
  }
}
