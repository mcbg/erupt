#' @export
sim <- function() {
  ds <- data.frame(name = seq_len(200), theta = rnorm(200))
  ll <- lapply(ds$theta, function(b) {
    t.test(rnorm(20), b + rnorm(20))
  })
  ds$effect_size <- sapply(ll, function(x) x$estimate[1] - x$estimate[2])
  ds$pvalue <- sapply(ll, function(x) x$p.value)
  ds$low <- sapply(ll, function(x) x$conf.int[1])
  ds$high <- sapply(ll, function(x) x$conf.int[2])
  ds$log_pvalue <- log(ds$pvalue)
  ds
}


