set.seed(123)
ds <- data.frame(name = seq_len(200), effect_size = rnorm(200))
ds$pvalue <- sapply(ds$effect_size, function(b) {
  t.test(rnorm(20), b + rnorm(20))$p.value
})
ds$log_pvalue <- log(ds$pvalue)

#' @export
APIstate <- R6Class('APIstate',
  public = list(
    ds = ds,
    initialize = function() {
    },
    set_ds = function(req) {
      self$ds <- req$body
    },
    get_ds = function() {
      return(self$ds)
    }
  )
)

#' @export
init_server <- function() {
  # state
  api <- APIstate$new()
 ?pr_get
  # plumber
  pr() %>%
    pr_static('/', './client/') %>%
    pr_post('/api', handler = api$set_ds) %>%
    pr_get('/api', handler = api$get_ds, serializer = serializer_json()) %>%
    pr_run(port=8999, docs = FALSE)
}
