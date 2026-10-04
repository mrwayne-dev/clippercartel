<?php
/**
 * honeypot.php — spam deterrent.
 *
 * Templates render a hidden `website` field; real browsers leave it empty,
 * bots gleefully fill every field they see. Non-empty = silently discard.
 *
 * We return success to the bot (don't tip them off), so they move on
 * without retrying with a different payload shape.
 */

function honeypotTripped(array $input): bool {
    return isset($input['website']) && trim((string) $input['website']) !== '';
}
