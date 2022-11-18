
APIstate <- R6::R6Class('APIstate',
  public = list(
    ds = data.frame(),
    initialize = function(ds) {
      self$ds <- ds
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
  ds <- sim()
  api <- APIstate$new(ds)
  client_path <- file.path(system.file(package = 'erupt'), 'client')
  # plumber
  pr() %>%
    pr_static('/', client_path) %>%
    pr_post('/api', handler = api$set_ds) %>%
    pr_get('/api', handler = api$get_ds, serializer = serializer_json()) %>%
    pr_run(port=8999, docs = FALSE)
}
