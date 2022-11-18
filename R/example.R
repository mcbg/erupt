library(erupt)
library(httr)
library(jsonlite)

hnd <- init()


set.seed(999)
ds <- data.frame(name = seq_len(200), effect_size = rnorm(200))
ds$pvalue <- sapply(ds$effect_size, function(b) {
  t.test(rnorm(20), b + rnorm(20))$p.value
})
ds$log_pvalue <- log(ds$pvalue)

# update dataset
POST('http://127.0.0.1:8999/api', body = toJSON(ds), encode = 'raw')

